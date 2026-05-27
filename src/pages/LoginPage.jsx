import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm.jsx';
import { useAuth } from '../auth/useAuth.js';

export function LoginPage() {
  const { user, login, configError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const from = location.state?.from?.pathname ?? '/game';

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await login(formData.get('email'), formData.get('password'));
      navigate(from, { replace: true });
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthForm
      mode="login"
      error={configError || error}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  );
}
