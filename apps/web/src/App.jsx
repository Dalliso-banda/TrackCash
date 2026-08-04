import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

// Context & Guards
import { AuthProvider } from './context/AuthContext';
import { ThemeModeProvider } from './context/ThemeModeContext'; // Manages dynamic theme state under the hood
import ProtectedRoute from './components/ProtectedRoutes';

// Pages Layouts
import Home from './pages/Home';
import RecordExpense from './pages/RecordExpense';
import StatsView from './pages/StatsView';
import SavingsView from './pages/SavingsView';
import Profile from './pages/Profile';
import LogIncome from './pages/LogIncome';
import OnBoarding from './pages/OnBoarding';
import LogInPage from './pages/Login';
import SignUp from './pages/SignUp';
import Budgeting from './pages/Budgeting';

export default function App() {
  return (
    <ThemeModeProvider> {/* 1. Generates and exposes the dynamic light/dark theme workspace */}
      <CssBaseline /> {/* 2. Listens to mode shifts and repaints global background layers */}
      <AuthProvider> {/* 3. Exposes login/logout global state actions */}
        <BrowserRouter>
          <Routes>
            {/* Public Onboarding Entry Points */}
            <Route path="/landing-page" element={<OnBoarding />} />
            <Route path="/login" element={<LogInPage />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Private Secured Dashboards (Bounces unauthenticated users to onboarding) */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/record" element={<ProtectedRoute><RecordExpense /></ProtectedRoute>} />
            <Route path="/stats" element={<ProtectedRoute><StatsView /></ProtectedRoute>} />
            <Route path="/save" element={<ProtectedRoute><SavingsView /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/income" element={<ProtectedRoute><LogIncome /></ProtectedRoute>} />
            <Route path="/budgeting" element={<ProtectedRoute><Budgeting /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeModeProvider>
  );
}
