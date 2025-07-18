import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '@/services/authService';

export function useRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerUser(name, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    loading,
    error,
    handleSubmit,
  };
}
