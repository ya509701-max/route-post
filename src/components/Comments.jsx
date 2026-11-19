import { useEffect, useState } from 'react';
import { api, pickList } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader, ErrorMessage, Avatar } from './UI.jsx';

const authorOf = (c) => c.commentCreator || {};
const idOf = (o) => o?._id || o?.id;

function Item({ postId, c, reload, isReply }) {
  const { user } = useAuth();
  const [err, setErr] = useState('');
  const [replies, setReplies] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(c.content || '');
  const a = authorOf(c);
  const mine = user && idOf(a) === idOf(user);
  const run = async (fn, after) => { setErr(''); try { await fn(); after ? after() : reload(); } catch (e) { setErr(e.message); } };
  const loadReplies = () => run(async () => setReplies(pickList(await api.replies(postId, idOf(c)))), () => {});
  return (
    <div className={isReply ? 'comment reply' : 'comment'}>
      <Avatar user={a} />
      <div className="cbody">
        <b>{a.name || 'User'}</b>
        {editing ? (
          <div className="row">
            <input value={editText} onChange={(e) => setEditText(e.target.value)} />
            <button className="btn small" onClick={() => editText.trim() ? run(() => api.updateComment(postId, idOf(c), editText), () => { setEditing(false); reload(); }) : setErr('Comment cannot be empty')}>Save</button>
            <button className="btn small ghost" onClick={() => { setEditing(false); setEditText(c.content || ''); }}>Cancel</button>
          </div>
        ) : <p>{c.content}</p>}
        {c.image && <img className="cimg" src={c.image} alt="" />}
        <div className="row">
          <button className="link" onClick={() => run(() => api.likeComment(postId, idOf(c)))}>{c.likes?.includes(idOf(user)) ? 'Unlike' : 'Like'} ({c.likes?.length ?? 0})</button>
          {mine && <button className="link" onClick={() => setEditing(true)}>Edit</button>}
          {mine && <button className="link" onClick={() => confirm('Delete comment?') && run(() => api.deleteComment(postId, idOf(c)))}>Delete</button>}
          {!isReply && <button className="link" onClick={loadReplies}>Replies ({c.repliesCount ?? 0})</button>}
        </div>
        <ErrorMessage message={err} />
        {!isReply && replies && (
          <>
            {replies.map((r) => <Item key={idOf(r)} postId={postId} c={r} isReply reload={loadReplies} />)}
            <form className="row" onSubmit={(e) => { e.preventDefault(); if (replyText.trim()) run(() => api.addReply(postId, idOf(c), replyText), () => { setReplyText(''); loadReplies(); }); }}>
              <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." />
              <button className="btn small">Reply</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function Comments({ postId }) {
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const [text, setText] = useState('');
  const [img, setImg] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = () => api.comments(postId).then((j) => setList(pickList(j))).catch((e) => { setList([]); setErr(e.message); });
  useEffect(() => { load(); }, [postId]);
  const submit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!text.trim()) return setErr('Comment cannot be empty');
    setBusy(true); setErr('');
    try { await api.addComment(postId, text, img); setText(''); setImg(null); form.reset(); await load(); }
    catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <div className="comments">
      <form onSubmit={submit}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment..." />
        <input type="file" accept="image/*" onChange={(e) => setImg(e.target.files[0])} />
        <button className="btn small" disabled={busy}>{busy ? '...' : 'Comment'}</button>
      </form>
      <ErrorMessage message={err} />
      {!list ? <Loader /> : list.map((c) => <Item key={idOf(c)} postId={postId} c={c} reload={load} />)}
    </div>
  );
}
