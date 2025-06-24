import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { loginUser } from '@/services/authService';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await loginUser(email, password);

      let user = null;
      let token = null;

      if (response) {
        if (response.token) {
          token = response.token;
        } else if (response.data && response.data.token) {
          token = response.data.token;
        } else if (response.accessToken) {
          token = response.accessToken;
        }

        if (response.user) {
          user = response.user;
        } else if (response.data && response.data.user) {
          user = response.data.user;
        }
      }

      if (!token) {
        throw new Error('No token received from server');
      }

      login(user, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleSubmit,
  };
}
