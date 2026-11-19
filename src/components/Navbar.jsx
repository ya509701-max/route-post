import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function Navbar() {
  const { logout } = useAuth();
  const nav = useNavigate();
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    api.unreadCount().then((j) => {
      setUnread(j.data?.unreadCount ?? 0);
    }).catch(() => {});
  }, []);
  return (
    <nav className="navbar">
      <strong className="brand">RoutePosts</strong>
      <div className="links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/bookmarks">Bookmarks</NavLink>
        <NavLink to="/notifications">Notifications{unread > 0 && <span className="badge">{unread}</span>}</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <button className="btn small" onClick={() => { logout(); nav('/login'); }}>Logout</button>
      </div>
    </nav>
  );
}
