// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';
import { AdminRoute } from './components/AdminRoute';
import UserManagement from './components/UserManagement';


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
                <Routes>
                    <Route path="/login" element={<AuthWrapper />} />
                    <Route path="/register" element={<AuthWrapper />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
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