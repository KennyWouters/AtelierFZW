
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            navigate('/login');
        } else {
            console.error('Error logging out:', error.message);
        }
    };

    const goToUserManagement = () => {
        navigate('/admin/users');
    };

    const goToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold"> Foyer FZW : Réservations Atelier </h1>
            {isAdmin && (
                <div>
                    <button
                        onClick={goToUserManagement}
                        className="bg-white text-blue-500 px-4 py-2 rounded mr-2"
                    >
                        User Management
                    </button>
                    <button
                        onClick={goToDashboard}
                        className="bg-white text-blue-500 px-4 py-2 rounded mr-2"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;