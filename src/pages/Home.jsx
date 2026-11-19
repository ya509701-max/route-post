import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, pickList } from '../api.js';
import PostCard from '../components/PostCard.jsx';
import CreatePost from '../components/CreatePost.jsx';
import { Loader, ErrorMessage, Avatar } from '../components/UI.jsx';

export default function Home() {
  const [tab, setTab] = useState('feed:all');
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState(null);
  const [err, setErr] = useState('');
  const [meta, setMeta] = useState(null);
  const [sugg, setSugg] = useState([]);
  const load = () => {
    setErr('');
    const req = tab === 'all' ? api.allPosts() : api.feed(tab.split(':')[1], page, 10);
    req.then((j) => { setPosts(pickList(j)); setMeta(j.meta?.pagination || null); }).catch((e) => { setPosts([]); setErr(e.message); });
  };
  useEffect(() => { setPosts(null); load(); }, [tab, page]);
  useEffect(() => { api.suggestions().then((j) => setSugg(pickList(j))).catch(() => {}); }, []);
  const follow = async (u) => {
    try { await api.follow(u._id || u.id); setSugg(sugg.filter((x) => x !== u)); }
    catch (e) { setErr('Follow failed: ' + e.message); }
  };
  return (
    <div className="layout">
      <main>
        <CreatePost onCreated={load} />
        <div className="row wrap tabs">
          {[['all', 'All posts'], ['feed:all', 'Feed'], ['feed:following', 'Following'], ['feed:me', 'My posts']].map(([k, l]) =>
            <button key={k} className={tab === k ? 'btn small' : 'btn small ghost'} onClick={() => { setPage(1); setTab(k); }}>{l}</button>)}
        </div>
        <ErrorMessage message={err} />
        {!posts ? <Loader /> : posts.length === 0 ? <p className="muted">No posts found.</p> : posts.map((p) => <PostCard key={p._id || p.id} post={p} onChange={load} />)}
        {tab !== 'all' && <div className="row"><button className="btn small ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button><span>Page {page}</span><button className="btn small ghost" disabled={!!meta && page >= meta.numberOfPages} onClick={() => setPage(page + 1)}>Next</button></div>}
      </main>
      <aside className="card">
        <h3>Suggestions</h3>
        {sugg.length === 0 && <p className="muted">None</p>}
        {sugg.map((u) => <div className="row" key={u._id || u.id}><Avatar user={u} /><div style={{ flex: 1 }}><Link to={`/users/${u._id}`}>{u.name}</Link><div className="muted">{u.followersCount} followers{u.mutualFollowersCount > 0 ? ` · ${u.mutualFollowersCount} mutual` : ''}</div></div><button className="btn small" onClick={() => follow(u)}>Follow</button></div>)}
      </aside>
    </div>
  );
}
