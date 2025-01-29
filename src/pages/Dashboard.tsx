import { useAuth } from '../context/AuthContext.tsx';
import { Link } from 'react-router-dom';
import Calendar from './Calendar.tsx';


const Dashboard = () => {
    const { isAdmin, signOut } = useAuth();

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

            {!isAdmin && (
                <Calendar />
            )}

            {isAdmin && (
                <Link
                    to="/admin/calendar"
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    View Calendar
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