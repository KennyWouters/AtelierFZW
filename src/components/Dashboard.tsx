import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, isAdmin, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        // Optionally, you can redirect the user to the login page after logout
        // window.location.href = '/login';
    };

    return (
        <div>
            {/* Existing dashboard content */}

            {isAdmin && (
                <Link
                    to="/admin/users"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    User Management
                </Link>
            )}

            <button
                onClick={handleLogout}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Logout
            </button>
        </div>
    );
};

export default Dashboard;