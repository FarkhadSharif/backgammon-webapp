import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import { SoundProvider } from './sound/SoundProvider.jsx';
import { ThemeProvider } from './theme/ThemeProvider.jsx';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SoundProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SoundProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
