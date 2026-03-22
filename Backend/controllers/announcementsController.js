import { supabase } from '../database.js';
import { insertDynamic, selectAll } from '../modules/dbUtil.js';

// Public: list announcements with optional filters department, type
async function listAnnouncements(req, res) {
  try {
    const { department, type } = req.query || {};
    const rows = await selectAll('announcements', { department, type });
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Protected: create announcement with role-based rules
//role,type,title is cumpulsory, description is optional
async function createAnnouncement(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const role = req.user.role;
    if (role === 'student') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const body = req.body || {};
    // Basic validation
    const allowedTypes = ['Club', 'Academic', 'Internship', 'Placement'];
    if (!body.type || !allowedTypes.includes(body.type)) {
      return res.status(400).json({ error: 'Invalid or missing type' });
    }
    if (role === 'club' && !body.club_id) {
      return res.status(400).json({ error: 'club_id is required for club announcements' });
    }
    // Enforce type rules
    const type = (body.type || '').trim();

    if (role === 'club') {
      if (type !== 'Club') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      // Verify club membership
      const { data: clubCheck, error: ccErr } = await supabase
        .from('user_clubs')
        .select('user_id')
        .eq('user_id', req.user.userId)
        .eq('club_id', body.club_id)
        .limit(1);
      if (ccErr) return res.status(500).json({ error: ccErr.message });
      if (!clubCheck || !clubCheck.length) {
        return res.status(403).json({ error: 'Forbidden: not a member of the club' });
      }
    }
    if (role === 'faculty') {
      const allowed = ['Academic', 'Internship', 'Placement'];
      if (!allowed.includes(type)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    // admin allowed all

    const data = {
      ...body,
      created_by: req.user.userId,
    };

    // Add club_name for admin-created club announcements
    if (role === 'admin' && type === 'Club' && body.club_name !== undefined) {
      data.club_name = body.club_name;
    }

    const inserted = await insertDynamic('announcements', data);
    return res.status(201).json(inserted);
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get filtered announcements for students (club announcements only from joined clubs)
async function getStudentFilteredAnnouncements(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
    
    const userId = req.user.userId;
    
    // Get student's joined clubs
    const { data: joinedClubs, error: clubsError } = await supabase
      .from('user_clubs')
      .select('club_id')
      .eq('user_id', userId)
      .eq('status', 'approved');
    
    if (clubsError) return res.status(500).json({ error: clubsError.message });
    
    const clubIds = (joinedClubs || []).map(item => item.club_id);
    
    // Get announcements: non-club announcements OR club announcements from joined clubs
    let data = [];
    
    if (clubIds.length > 0) {
      // Student has joined clubs: get both non-club announcements and club announcements from joined clubs
      const [nonClubAnnouncements, clubAnnouncements] = await Promise.all([
        // Get all non-club announcements
        supabase
          .from('announcements')
          .select('id,title,description,type,created_at,club_name')
          .neq('type', 'Club')
          .order('created_at', { ascending: false }),
        // Get club announcements from joined clubs
        supabase
          .from('announcements')
          .select('id,title,description,type,created_at,club_name')
          .eq('type', 'Club')
          .in('club_id', clubIds)
          .order('created_at', { ascending: false })
      ]);
      
      // Combine and sort by date
      data = [...(nonClubAnnouncements.data || []), ...(clubAnnouncements.data || [])]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      // Student has no joined clubs: show only non-club announcements
      const { data: nonClubAnnouncements, error } = await supabase
        .from('announcements')
        .select('id,title,description,type,created_at,club_name')
        .neq('type', 'Club')
        .order('created_at', { ascending: false });
      
      if (error) return res.status(500).json({ error: error.message });
      data = nonClubAnnouncements || [];
    }
    
    return res.json(data || []);
  } catch (err) {
    console.error('getStudentFilteredAnnouncements error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export { listAnnouncements, createAnnouncement, getStudentFilteredAnnouncements };
