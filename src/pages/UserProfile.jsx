import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader, ErrorMessage, Avatar, UserList } from '../components/UI.jsx';

export default function UserProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState(null); // { user, isFollowing }
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.userProfile(id).then((j) => setData(j.data)).catch((e) => setErr(e.message));
  useEffect(() => {
    if (id === user?._id) return nav('/profile', { replace: true });
    setData(null); setErr(''); load();
  }, [id]);

  const toggleFollow = async () => {
    setBusy(true); setErr('');
    try { await api.follow(id); await load(); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  if (!data) return <><Loader /><ErrorMessage message={err} /></>;
  const u = data.user;
  return (
    <div className="page">
      <section className="card">
        <div className="row">
          <Avatar user={u} />
          <div><h2>{u.name}</h2><div className="muted">@{u.username}</div></div>
          <button className="btn small" style={{ marginLeft: 'auto' }} disabled={busy} onClick={toggleFollow}>
            {busy ? '...' : data.isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        </div>
        <ErrorMessage message={err} />
        <div className="row wrap"><span>Followers: {u.followersCount}</span><span>Following: {u.followingCount}</span></div>
        <UserList title="Followers" users={u.followers} />
        <UserList title="Following" users={u.following} />
        <p className="muted">The API has no endpoint for another user's posts, so only their profile data is shown.</p>
      </section>
    </div>
  );
}
