// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AuthForm from './components/AuthForm';
import Dashboard from './pages/Dashboard.tsx';
import { useAuth } from './context/AuthContext';
import { AdminRoute } from './components/AdminRoute';
import UserManagement from './pages/UserManagement.tsx';
import Header from "./components/Header.tsx";
import UserDetails from './components/UserDetails';
import Calendar from './pages/Calendar.tsx';
import AdminCalendar from "./pages/AdminCalendar.tsx";
import DateDetails from "./components/DateDetails.tsx";



// Wrapper component for auth form to handle redirects
const AuthWrapper = () => {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <AuthForm />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Header />
                <Routes>

                    <Route path="/login" element={<AuthWrapper />} />
                    <Route path="/register" element={<AuthWrapper />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/admin/users/:userId" element={<UserDetails />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/admin/calendar" element={<AdminCalendar />} />
                        <Route path="/admin/calendar/:date" element={<DateDetails />} />
                        {/* Add more protected routes here */}
                    </Route>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route element={<AdminRoute />}>
                        <Route path="/admin/users" element={<UserManagement />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;