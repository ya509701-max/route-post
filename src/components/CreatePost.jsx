import { useState } from 'react';
import { api } from '../api.js';
import { ErrorMessage } from './UI.jsx';

export default function CreatePost({ onCreated }) {
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!body.trim() && !image) return setErr('Write something or add an image');
    setBusy(true); setErr('');
    try { await api.createPost(body, image); setBody(''); setImage(null); form.reset(); onCreated(); }
    catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <form className="card" onSubmit={submit}>
      <textarea rows="3" value={body} onChange={(e) => setBody(e.target.value)} placeholder="What's on your mind?" />
      <div className="row wrap"><input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <button className="btn" disabled={busy}>{busy ? 'Posting...' : 'Post'}</button></div>
      <ErrorMessage message={err} />
    </form>
  );
}
