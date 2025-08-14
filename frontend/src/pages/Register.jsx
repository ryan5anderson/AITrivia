import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin + '/login'
      }
    });
    if (signUpError) {
      const message = (signUpError.message || '').toLowerCase();
      if (message.includes('already') && message.includes('registered')) {
        setError('An account with this email already exists. Please log in.');
      } else if (signUpError.status === 400) {
        setError('An account with this email may already exist. Try logging in.');
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }
    if (data && data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setError('An account with this email already exists. Please log in.');
      setLoading(false);
      return;
    }
    setLoading(false);
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '400px', margin: '3rem auto', textAlign: 'center' }}>
      <h2>Register</h2>
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
      )}
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default Register;
