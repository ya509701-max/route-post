import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import PostCard from '../components/PostCard.jsx';
import { Loader, ErrorMessage } from '../components/UI.jsx';

export default function PostDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);
  const [err, setErr] = useState('');
  const load = () => api.getPost(id).then((j) => setPost(j.data.post)).catch((e) => { setErr(e.message); setPost(false); });
  useEffect(() => { load(); }, [id]);
  return (
    <div className="page">
      <button className="btn small ghost" onClick={() => nav(-1)}>Back</button>
      <ErrorMessage message={err} />
      {post === null ? <Loader /> : post && <PostCard post={post} onChange={load} showComments />}
    </div>
  );
}
