import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorMessage } from '../components/UI.jsx';

export const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
export const PASSWORD_MSG = 'Password must be 8+ chars with a capital letter, a small letter, a number and a special character (#?!@$%^&*-)';

export default function Auth({ mode }) {
  const signup = mode === 'signup';
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', username: '', email: '', dateOfBirth: '', gender: 'male', password: '', rePassword: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a valid email');
    if (!PASSWORD_REGEX.test(f.password)) return setErr(PASSWORD_MSG);
    if (signup) {
      if (!f.name.trim() || !f.username.trim()) return setErr('Name and username are required');
      if (!f.dateOfBirth) return setErr('Date of birth is required');
      if (f.password !== f.rePassword) return setErr('Passwords do not match');
    }
    setBusy(true);
    try {
      if (signup) await api.signup(f);
      await login(f.email, f.password);
      nav('/');
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <div className="auth">
      <form className="card" onSubmit={submit}>
        <h2>{signup ? 'Create account' : 'Sign in'}</h2>
        {signup && <>
          <input placeholder="Full name" value={f.name} onChange={set('name')} />
          <input placeholder="Username" value={f.username} onChange={set('username')} />
        </>}
        <input type="email" placeholder="Email" value={f.email} onChange={set('email')} />
        {signup && <>
          <input type="date" value={f.dateOfBirth} onChange={set('dateOfBirth')} />
          <select value={f.gender} onChange={set('gender')}><option value="male">Male</option><option value="female">Female</option></select>
        </>}
        <input type="password" placeholder="Password" value={f.password} onChange={set('password')} />
        {signup && <input type="password" placeholder="Confirm password" value={f.rePassword} onChange={set('rePassword')} />}
        <ErrorMessage message={err} />
        <button className="btn" disabled={busy}>{busy ? 'Please wait...' : signup ? 'Sign up' : 'Sign in'}</button>
        <p className="muted">{signup ? <>Have an account? <Link to="/login">Sign in</Link></> : <>New here? <Link to="/signup">Create account</Link></>}</p>
      </form>
    </div>
  );
}
