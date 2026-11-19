import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Auth from './pages/Auth.jsx';
import Home from './pages/Home.jsx';
import PostDetails from './pages/PostDetails.jsx';
import UserProfile from './pages/UserProfile.jsx';
import Profile from './pages/Profile.jsx';
import Bookmarks from './pages/Bookmarks.jsx';
import Notifications from './pages/Notifications.jsx';

function Protected({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}
export default function App() {
  const { token } = useAuth();
  return (
    <>
      {token && <Navbar />}
      <Routes>
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="/" element={<Protected><Home /></Protected>} />
        <Route path="/posts/:id" element={<Protected><PostDetails /></Protected>} />
        <Route path="/users/:id" element={<Protected><UserProfile /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/bookmarks" element={<Protected><Bookmarks /></Protected>} />
        <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
