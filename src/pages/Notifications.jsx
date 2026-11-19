import { useEffect, useState } from 'react';
import { api, pickList } from '../api.js';
import { Loader, ErrorMessage } from '../components/UI.jsx';

export default function Notifications() {
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const load = () => api.notifications(1, 10, unreadOnly).then((j) => setList(pickList(j))).catch((e) => { setErr(e.message); setList([]); });
  useEffect(() => { setList(null); load(); }, [unreadOnly]);
  const run = async (fn) => { try { await fn(); load(); } catch (e) { setErr(e.message); } };
  return (
    <div className="page">
      <div className="row"><h2 style={{ flex: 1 }}>Notifications</h2><button className="btn small" onClick={() => run(api.readAll)}>Mark all as read</button></div>
      <label><input type="checkbox" style={{ width: 'auto' }} checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} /> Unread only</label>
      <ErrorMessage message={err} />
      {!list ? <Loader /> : list.length === 0 ? <p className="muted">No notifications.</p> : list.map((n) => (
        <div key={n._id || n.id} className={`card row ${n.isRead || n.read ? '' : 'unread'}`}>
          <span style={{ flex: 1 }}>{n.message || n.type || 'Notification'}</span>
          {!(n.isRead || n.read) && <button className="btn small ghost" onClick={() => run(() => api.readOne(n._id || n.id))}>Mark read</button>}
        </div>))}
    </div>
  );
}
