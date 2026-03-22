import { supabase } from '../database.js';

const VALID_TYPES = ['announcement', 'event'];

async function saveItem(req, res) {
  try {
    const userId = req.user?.userId;
    const { item_id, item_type } = req.body || {};
    if (!userId || !item_id || !item_type || !VALID_TYPES.includes(item_type)) {
      return res.status(400).json({ ok: false, error: 'Invalid input' });
    }

    // 1) Verify target exists in appropriate table
    const targetTable = item_type === 'announcement' ? 'announcements' : 'events';
    const { data: target, error: targetErr } = await supabase
      .from(targetTable)
      .select('id')
      .eq('id', item_id)
      .limit(1);
    if (targetErr){
      return res.status(500).json({ ok:false, error: targetErr.message });}
    if (!target || !target.length) return res.status(400).json({ ok:false, error: 'Target item does not exist' });

    // 2) Toggle: if exists -> delete (unsave), else insert (save)
    const savedTable = item_type === 'announcement' ? 'saved_announcements' : 'saved_events';
    const { data: existing, error: dupErr } = await supabase
      .from(savedTable)
      .select('user_id')
      .eq('user_id', userId)
      .eq('item_id', item_id)
      .maybeSingle();
    if (dupErr) return res.status(500).json({ ok:false, error: dupErr.message });
    if (existing) {
      const { error: delErr } = await supabase
        .from(savedTable)
        .delete()
        .eq('user_id', userId)
        .eq('item_id',item_id);
      if (delErr) return res.status(500).json({ ok:false, error: delErr.message });
      return res.json({ ok: true, saved: false });
    }

    // 3) Insert (save)
    const { error: insErr } = await supabase
      .from(savedTable)
      .insert([{ user_id: userId, item_id }]);
    if (insErr) return res.status(500).json({ ok:false, error: insErr.message });
    return res.json({ ok: true, saved: true });

  } catch (err) {
    console.error('saveItem failed:', err);
    return res.status(500).json({ ok: false });
  }
}


async function listSaved(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.userId;

    let annsRes = { data: [] };
    let evtsRes = { data: [] };
    try {
      annsRes = await supabase
        .from('saved_announcements')
        .select('item_id,saved_at')
        .eq('user_id', userId);
    } catch (e) {
      console.error('SavedAnnouncements fetch error:', e);
      annsRes = { data: [] };
    }
    if (annsRes.error) {
      console.error('SavedAnnouncements query error:', annsRes.error);
      annsRes.data = [];
    }

    try {
      evtsRes = await supabase
        .from('saved_events')
        .select('item_id,saved_at')
        .eq('user_id', userId);
    } catch (e) {
      console.error('SavedEvents fetch error:', e);
      evtsRes = { data: [] };
    }
    if (evtsRes.error) {
      console.error('SavedEvents query error:', evtsRes.error);
      evtsRes.data = [];
    }

    const anns = (annsRes.data || []).map(r => ({ user_id: userId, item_id: r.item_id, item_type: 'announcement', saved_at: r.created_at }));
    const evts = (evtsRes.data || []).map(r => ({ user_id: userId, item_id: r.item_id, item_type: 'event', saved_at: r.created_at }));
    const combined = [...anns, ...evts].sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at));
    return res.json(combined);
  } catch (err) {
    console.error('listSaved error:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
  }
}

export { saveItem, listSaved };

// Saved announcements with join
async function listSavedAnnouncements(req, res){
  try{
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { data: saved, error: savedErr } = await supabase
      .from('saved_announcements')
      .select('item_id')
      .eq('user_id', req.user.userId)
      .order('saved_at', { ascending: false });
    if (savedErr) return res.status(500).json({ error: savedErr.message });
    const ids = (saved || []).map(r => r.item_id);
    if (!ids.length) return res.json([]);
    const { data, error } = await supabase
      .from('announcements')
      .select('id,title,description,type,created_at,club_name')
      .in('id', ids);
    if (error) return res.status(500).json({ error: error.message });
    const byId = new Map((data || []).map(a => [a.id, a]));
    const ordered = (saved || []).map(s => byId.get(s.item_id)).filter(Boolean);
    return res.json(ordered);
  } catch(err){
    console.error('listSavedAnnouncements error:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
  }
}

// Saved events with join
async function listSavedEvents(req, res){
  try{
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { data: saved, error: savedErr } = await supabase
      .from('saved_events')
      .select('item_id')
      .eq('user_id', req.user.userId)
      .order('saved_at', { ascending: false });
    if (savedErr) return res.status(500).json({ error: savedErr.message });
    const ids = (saved || []).map(r => r.item_id);
    if (!ids.length) return res.json([]);
    const { data, error } = await supabase
      .from('events')
      .select('id,title,description,category,department,event_date')
      .in('id', ids);
    if (error) return res.status(500).json({ error: error.message });
    const byId = new Map((data || []).map(e => [e.id, e]));
    const ordered = (saved || []).map(s => byId.get(s.item_id)).filter(Boolean);
    return res.json(ordered);
  } catch(err){
    console.error('listSavedEvents error:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
  }
}

export { listSavedAnnouncements, listSavedEvents };
