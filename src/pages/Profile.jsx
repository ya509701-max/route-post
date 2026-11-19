import { useEffect, useState } from 'react';
import { api, pickList } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PostCard from '../components/PostCard.jsx';
import { Loader, ErrorMessage, Success, Avatar } from '../components/UI.jsx';
import { PASSWORD_REGEX, PASSWORD_MSG } from './Auth.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [me, setMe] = useState(user);
  const [posts, setPosts] = useState(null);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [pw, setPw] = useState({ password: '', newPassword: '' });
  const loadMe = () => api.myProfile().then((j) => { const u = j.data?.user || j.data; setMe(u); updateUser(u); }).catch((e) => setErr(e.message));
  const loadPosts = () => api.myPosts().then((j) => setPosts(pickList(j))).catch((e) => { setErr(e.message); setPosts([]); });
  useEffect(() => { loadMe(); loadPosts(); }, []);

  const upload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setErr(''); setOk('');
    try { await api.uploadPhoto(file); setOk('Photo updated'); loadMe(); } catch (x) { setErr(x.message); }
  };
  const changePw = async (e) => {
    e.preventDefault(); setErr(''); setOk('');
    if (!pw.password) return setErr('Enter your current password');
    if (!PASSWORD_REGEX.test(pw.newPassword)) return setErr(PASSWORD_MSG);
    try { await api.changePassword(pw); setOk('Password changed'); setPw({ password: '', newPassword: '' }); } catch (x) { setErr(x.message); }
  };
  if (!me) return <><Loader /><ErrorMessage message={err} /></>;
  return (
    <div className="page">
      <section className="card">
        <div className="row"><Avatar user={me} /><div><h2>{me.name}</h2><div className="muted">@{me.username} · {me.email}</div></div></div>
        <div className="row wrap"><span>Followers: {me.followersCount ?? me.followers?.length ?? 0}</span><span>Following: {me.followingCount ?? me.following?.length ?? 0}</span></div>
        <label>Profile photo: <input type="file" accept="image/*" onChange={upload} /></label>
        <ErrorMessage message={err} /><Success message={ok} />
        <form onSubmit={changePw}>
          <h3>Change password</h3>
          <input type="password" placeholder="Current password" value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} />
          <input type="password" placeholder="New password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          <button className="btn small">Change</button>
        </form>
      </section>
      <h3>My posts</h3>
      {!posts ? <Loader /> : posts.length === 0 ? <p className="muted">No posts yet.</p> : posts.map((p) => <PostCard key={p._id || p.id} post={p} onChange={loadPosts} />)}
    </div>
  );
}
