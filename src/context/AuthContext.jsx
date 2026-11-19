import { createContext, useContext, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });

  const login = async (email, password) => {
    const json = await api.signin({ email, password });
    const t = json.data?.token;
    if (!t) throw new Error('No token returned by the API');
    localStorage.setItem('token', t);
    setToken(t);
    const u = json.data?.user || null; // signin returns data.token and data.user
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setToken(null); setUser(null); };
  const updateUser = (u) => { localStorage.setItem('user', JSON.stringify(u)); setUser(u); };

  return <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>{children}</AuthContext.Provider>;
}
