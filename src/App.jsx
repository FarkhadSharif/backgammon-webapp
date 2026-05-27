import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';
import { GamePage } from './pages/GamePage.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { LeaderboardPage } from './pages/LeaderboardPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { MatchHistoryPage } from './pages/MatchHistoryPage.jsx';
import { OnlineRoomPage } from './pages/OnlineRoomPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { SkinSelectionPage } from './pages/SkinSelectionPage.jsx';
import { SkinThemeSync } from './theme/SkinThemeSync.jsx';

function App() {
  return (
    <>
      <SkinThemeSync />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/game" element={<GamePage />} />
          <Route path="/history" element={<MatchHistoryPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/skins" element={<SkinSelectionPage />} />
          <Route path="/statistics" element={<Navigate to="/profile" replace />} />
          <Route path="/room/:roomCode" element={<OnlineRoomPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
