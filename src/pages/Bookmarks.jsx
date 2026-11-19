import { useEffect, useState } from 'react';
import { api, pickList } from '../api.js';
import PostCard from '../components/PostCard.jsx';
import { Loader, ErrorMessage } from '../components/UI.jsx';

export default function Bookmarks() {
  const [posts, setPosts] = useState(null);
  const [err, setErr] = useState('');
  const load = () => api.bookmarks().then((j) => setPosts(pickList(j))).catch((e) => { setErr(e.message); setPosts([]); });
  useEffect(() => { load(); }, []);
  return (
    <div className="page"><h2>Bookmarks</h2><ErrorMessage message={err} />
      {!posts ? <Loader /> : posts.length === 0 ? <p className="muted">No bookmarks.</p> : posts.map((p) => <PostCard key={p._id || p.id} post={p} onChange={load} />)}
    </div>
  );
}
