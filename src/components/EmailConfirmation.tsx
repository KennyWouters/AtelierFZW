// src/components/EmailConfirmation.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const EmailConfirmation = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState(true);
    const [confirmationStatus, setConfirmationStatus] = useState<'pending' | 'success' | 'error'>('pending');

    useEffect(() => {
        const confirmEmail = async () => {
            try {
                setIsConfirming(true);

                // Get the hash from the URL
                const hash = window.location.hash;
                // Remove the # from the hash
                const token = hash.replace('#', '');

                if (!token) {
                    throw new Error('No confirmation token found');
                }

                console.log('Attempting to verify with token:', token);

                const { error, data } = await supabase.auth.verifyOtp({
                    token_hash: token,
                    type: 'signup'
                });

                console.log('Verification response:', { error, data });

                if (error) {
                    throw error;
                }

                setConfirmationStatus('success');

                // Wait a bit before redirecting
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (err) {
                console.error('Confirmation error:', err);
                setError(err instanceof Error ? err.message : 'An error occurred during confirmation');
                setConfirmationStatus('error');
            } finally {
                setIsConfirming(false);
            }
        };

        confirmEmail();
    }, [navigate]);

    const handleReturnToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Email Confirmation</h2>

                    {isConfirming && (
                        <div className="mt-4">
                            <p className="text-gray-600">Confirming your email...</p>
                            <div className="mt-4 flex justify-center">
                                {/* You can add a loading spinner here */}
                            </div>
                        </div>
                    )}

                    {!isConfirming && confirmationStatus === 'success' && (
                        <div className="mt-4">
                            <p className="text-green-600">Email confirmed successfully!</p>
                            <p className="text-gray-600 mt-2">Redirecting to login in 3 seconds...</p>
                            <button
                                onClick={handleReturnToLogin}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}

                    {!isConfirming && confirmationStatus === 'error' && (
                        <div className="mt-4">
                            <p className="text-red-600">{error}</p>
                            <p className="text-gray-600 mt-2">Please try again or contact support if the problem persists.</p>
                            <button
                                onClick={handleReturnToLogin}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Return to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailConfirmation;