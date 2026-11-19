export const Loader = () => <div className="loader">Loading...</div>;
export const ErrorMessage = ({ message }) => message ? <div className="error">{message}</div> : null;
export const Success = ({ message }) => message ? <div className="success">{message}</div> : null;
export const Avatar = ({ user }) => user?.photo
  ? <img className="avatar" src={user.photo} alt="" />
  : <div className="avatar ph">{(user?.name || '?')[0]}</div>;

import { Link } from 'react-router-dom';
export function UserList({ title, users }) {
  const list = Array.isArray(users) ? users.filter((u) => u && typeof u === 'object') : [];
  return (
    <div>
      <h4>{title} ({Array.isArray(users) ? users.length : 0})</h4>
      {list.length === 0 && <p className="muted">Nothing to show.</p>}
      {list.map((u) => <div className="row" key={u._id || u.id}><Avatar user={u} /><Link to={`/users/${u._id || u.id}`}>{u.name || u.username}</Link></div>)}
    </div>
  );
}
