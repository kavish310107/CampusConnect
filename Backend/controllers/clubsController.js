import { supabase } from '../database.js';
import { insertDynamic, selectAll } from '../modules/dbUtil.js';

async function listClubs(req, res) {
  try {
    const rows = await selectAll('clubs');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// List clubs plus the requesting user's membership status if authenticated
async function listClubsWithStatus(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.userId;
    const { data: clubs, error: clubsErr } = await supabase
      .from('clubs')
      .select('*')
      .order('id', { ascending: true });
    if (clubsErr) return res.status(500).json({ error: clubsErr.message });
    const { data: memberships, error: memErr } = await supabase
      .from('user_clubs')
      .select('club_id,status')
      .eq('user_id', userId);

    if (memErr) return res.status(500).json({ error: memErr.message });
    const statusMap = new Map((memberships || []).map(m => [String(m.club_id), m.status]));
    const out = (clubs || []).map(c => ({ ...c, membership_status: statusMap.get(String(c.id)) || null }));
    return res.json(out);
  } 
  catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

//can be created only by role===admin
async function createClub(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const body = req.body || {};
    const name = (body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const payload = {
      name,
      description: (body.description || '').trim() || null,
      image_url: (body.image_url || '').trim() || null,
      created_at: new Date().toISOString(),
    };
    const inserted = await insertDynamic('clubs', payload);
    // Add creator as club admin in user_clubs
    try {
      if (inserted && inserted.id) {
        await supabase
          .from('user_clubs')
          .insert([{ user_id: req.user.userId, club_id: inserted.id, role: 'admin', status: 'approved' }]);
      }
    } catch (e) { /* ignore linkage failure */ }
    return res.status(201).json(inserted);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// 1) User joins a club
async function joinClub(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.userId;
    const clubId = req.params.clubId;
    if (!clubId) return res.status(400).json({ error: 'clubId is required' });

    // Prevent duplicates
    const { data: exists, error: exErr } = await supabase
      .from('user_clubs')
      .select('user_id')
      .eq('user_id', userId)
      .eq('club_id', clubId)
      .limit(1);
    if (exErr) return res.status(500).json({ error: exErr.message });
    if (exists && exists.length) {
      return res.status(200).json({ ok: true, message: 'Already requested or member' });
    }

    const { error: insErr } = await supabase
      .from('user_clubs')
      .insert([{ user_id: userId, club_id: clubId, role: 'member', status: 'pending' }]);
    if (insErr) return res.status(500).json({ error: insErr.message });
    return res.status(201).json({ ok: true, message: 'Join request submitted' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// 2) Admin fetches pending requests for a club
async function getPendingRequests(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.userId;
    const clubId = req.params.clubId;

    if (!clubId) return res.status(400).json({ error: 'clubId is required' });
    // Verify requester is admin of the club
    const { data: adminRows, error: admErr } = await supabase
      .from('user_clubs')
      .select('user_id')
      .eq('user_id', userId)
      .eq('club_id', clubId)
      .eq('role', 'admin')
      .eq('status', 'approved')
      .limit(1);
    if (admErr) return res.status(500).json({ error: admErr.message });
    if (!adminRows || !adminRows.length) return res.status(403).json({ error: 'Forbidden' });

    const { data: pend, error: pendErr } = await supabase
      .from('user_clubs')
      .select('user_id,status')
      .eq('club_id', clubId)
      .eq('status', 'pending')
      .order('user_id', { ascending: false });
    if (pendErr) return res.status(500).json({ error: pendErr.message });
    const ids = (pend || []).map(r => r.user_id);
    if (!ids.length) return res.json([]);
    const { data: users, error: usrErr } = await supabase
      .from('users')
      .select('id,name,email')
      .in('id', ids);
    if (usrErr) return res.status(500).json({ error: usrErr.message });
    const userMap = new Map((users || []).map(u => [u.id, u]));
    const out = (pend || []).map(r => ({ id: r.user_id, status: r.status, name: userMap.get(r.user_id)?.name, email: userMap.get(r.user_id)?.email }));
    return res.json(out);
  } 
  catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// 3) Admin approves or rejects a user_clubs request
async function updateUserClubStatus(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const adminUserId = req.user.userId;
    const clubId = req.params.clubId;
    const targetUserId = req.params.userId;
    const { status } = req.body || {};

    const allowed = ['approved', 'rejected'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify requester is approved admin of the club
    const { data: adminRows, error: admErr } = await supabase
      .from('user_clubs')
      .select('user_id')
      .eq('user_id', adminUserId)
      .eq('club_id', clubId)
      .eq('role', 'admin')
      .eq('status', 'approved')
      .limit(1);
    if (admErr) return res.status(500).json({ error: admErr.message });
    if (!adminRows || !adminRows.length) return res.status(403).json({ error: 'Forbidden' });

    const { error } = await supabase
      .from('user_clubs')
      .update({ status })
      .eq('user_id', targetUserId)
      .eq('club_id', clubId);
    if (error) return res.status(500).json({ error: error.message });

    return res.json({ ok: true, message: 'Status updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// 4) List approved members for a club (only club admin allowed)
async function getClubMembers(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.userId;
    const clubId = req.params.clubId;
    if (!clubId) return res.status(400).json({ error: 'clubId is required' });

    const { data: adminRows, error: admErr } = await supabase
      .from('user_clubs')
      .select('user_id')
      .eq('user_id', userId)
      .eq('club_id', clubId)
      .eq('role', 'admin')
      .eq('status', 'approved')
      .limit(1);
    if (admErr) return res.status(500).json({ error: admErr.message });
    if (!adminRows || !adminRows.length) return res.status(403).json({ error: 'Forbidden' });

    const { data: approved, error: appErr } = await supabase
      .from('user_clubs')
      .select('user_id,role')
      .eq('club_id', clubId)
      .eq('status', 'approved');
    if (appErr) return res.status(500).json({ error: appErr.message });
    const ids = (approved || []).map(r => r.user_id);
    if (!ids.length) return res.json([]);
    const { data: users, error: usrErr } = await supabase
      .from('users')
      .select('id,name,email')
      .in('id', ids)
      .order('name', { ascending: true });
    if (usrErr) return res.status(500).json({ error: usrErr.message });
    const roleMap = new Map((approved || []).map(r => [r.user_id, r.role]));
    const out = (users || []).map(u => ({ user_id: u.id, role: roleMap.get(u.id), name: u.name, email: u.email }));
    return res.json(out);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


// New: update status and return the updated row
async function updateUserClubStatusV2(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const adminUserId = req.user.userId;
    const clubId = req.params.clubId;
    const targetUserId = req.params.userId;
    const { status } = req.body || {};

    const allowed = ['approved', 'rejected'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data: adminRows, error: admErr } = await supabase
      .from('user_clubs')
      .select('user_id')
      .eq('user_id', adminUserId)
      .eq('club_id', clubId)
      .eq('role', 'admin')
      .eq('status', 'approved')
      .limit(1);
    if (admErr) return res.status(500).json({ error: admErr.message });
    if (!adminRows || !adminRows.length) return res.status(403).json({ error: 'Forbidden' });

    const { data, error } = await supabase
      .from('user_clubs')
      .update({ status })
      .eq('user_id', targetUserId)
      .eq('club_id', clubId)
      .select('user_id, club_id, role, status')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Request not found' });
    return res.json({ id: data.user_id, club_id: data.club_id, role: data.role, status: data.status });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get clubs joined by the logged-in student
async function getJoinedClubs(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.userId;
    
    const { data, error } = await supabase
      .from('user_clubs')
      .select('club_id')
      .eq('user_id', userId)
      .eq('status', 'approved');
    
    if (error) return res.status(500).json({ error: error.message });
    
    const clubIds = (data || []).map(item => item.club_id);
    return res.json(clubIds);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export { listClubs, listClubsWithStatus, createClub, joinClub, getPendingRequests, updateUserClubStatus, getClubMembers, updateUserClubStatusV2, getJoinedClubs };
