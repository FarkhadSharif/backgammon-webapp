import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm.jsx';
import { useAuth } from '../auth/useAuth.js';

export function RegisterPage() {
  const { user, register, configError } = useAuth();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/game" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const data = await register(
        formData.get('email'),
        formData.get('password'),
        formData.get('displayName'),
        formData.get('city'),
      );

      if (!data.session) {
        setNotice('Account created. Check your email to confirm before logging in.');
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthForm
      mode="register"
      error={configError || error}
      notice={notice}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  );
}
