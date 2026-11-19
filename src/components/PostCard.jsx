import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorMessage, Avatar } from './UI.jsx';
import Comments from './Comments.jsx';

function Author({ u, myId }) {
  return u?._id
    ? <Link to={u._id === myId ? '/profile' : `/users/${u._id}`}><b>{u.name}</b></Link>
    : <b>User</b>;
}

export default function PostCard({ post, onChange, showComments = false }) {
  const { user } = useAuth();
  const myId = user?._id;
  const [open, setOpen] = useState(showComments);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(post.body || '');
  const [newImg, setNewImg] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const id = post._id;
  const mine = post.user?._id === myId;
  const liked = post.likes?.includes(myId);
  const shared = post.sharedPost;
  const run = async (fn, after) => { setBusy(true); setErr(''); try { await fn(); after && after(); onChange && onChange(); } catch (e) { setErr(e.message); } finally { setBusy(false); } };
  const save = () => {
    if (!text.trim()) return setErr('Post text cannot be empty');
    run(() => api.updatePost(id, text, newImg), () => { setEditing(false); setNewImg(null); });
  };
  return (
    <article className="card post">
      <header className="row">
        <Avatar user={post.user} />
        <div>
          <Author u={post.user} myId={myId} />
          {post.isShare && <span className="muted"> shared a post</span>}
          <div className="muted">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</div>
        </div>
      </header>
      {editing ? (
        <>
          <textarea rows="3" value={text} onChange={(e) => setText(e.target.value)} />
          <input type="file" accept="image/*" onChange={(e) => setNewImg(e.target.files[0])} />
          <div className="row">
            <button className="btn small" disabled={busy} onClick={save}>{busy ? 'Saving...' : 'Save'}</button>
            <button className="btn small ghost" onClick={() => { setEditing(false); setText(post.body || ''); }}>Cancel</button>
          </div>
        </>
      ) : post.body && <p>{post.body}</p>}
      {post.image && <img className="pimg" src={post.image} alt="" />}
      {shared && (
        <div className="card shared">
          <div className="row"><Avatar user={shared.user} /><Author u={shared.user} myId={myId} /></div>
          {shared.body && <p>{shared.body}</p>}
          {shared.image && <img className="pimg" src={shared.image} alt="" />}
        </div>
      )}
      <div className="row wrap">
        <button className="link" disabled={busy} onClick={() => run(() => api.likePost(id))}>{liked ? 'Unlike' : 'Like'} ({post.likesCount ?? 0})</button>
        <button className="link" disabled={busy} onClick={() => run(() => api.bookmarkPost(id))}>{post.bookmarked ? 'Unbookmark' : 'Bookmark'}</button>
        <button className="link" disabled={busy} onClick={() => { const t = prompt('Add a message to your share'); if (t !== null) run(() => api.sharePost(id, t)); }}>Share ({post.sharesCount ?? 0})</button>
        <button className="link" onClick={() => setOpen(!open)}>Comments ({post.commentsCount ?? 0})</button>
        <Link className="link" to={`/posts/${id}`}>Details</Link>
        {mine && <button className="link" disabled={busy} onClick={() => setEditing(true)}>Edit</button>}
        {mine && <button className="link" disabled={busy} onClick={() => confirm('Delete this post?') && run(() => api.deletePost(id))}>Delete</button>}
      </div>
      <ErrorMessage message={err} />
      {open && <Comments postId={id} />}
    </article>
  );
}
