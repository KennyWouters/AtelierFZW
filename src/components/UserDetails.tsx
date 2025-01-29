import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface UserType {
    id: string;
    email: string;
    created_at: string;
    user_metadata?: {
        name?: string;
        email_verified?: boolean;
    };
    is_active: boolean;
}

interface CalendarDateType {
    date: string;
}

const UserDetails = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<UserType | null>(null);
    const [selectedDates, setSelectedDates] = useState<CalendarDateType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data, error } = await supabase.auth.admin.getUserById(userId as string);
                if (error) throw error;
                setUser(data.user);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchSelectedDates = async () => {
            try {
                const { data, error } = await supabase
                    .from('calendar_dates')
                    .select('date')
                    .eq('user_id', userId as string);
                if (error) throw error;
                setSelectedDates(data || []);
            } catch (error: any) {
                setError(error.message);
            }
        };

        if (userId) {
            fetchUser();
            fetchSelectedDates();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg font-medium text-gray-700">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50 text-red-700 px-6 py-4 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-indigo-600">
                        <h1 className="text-2xl font-bold text-white">User Details</h1>
                    </div>

                    {user && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoCard label="ID" value={user.id} />
                                <InfoCard label="Email" value={user.email} />
                                <InfoCard
                                    label="Created At"
                                    value={new Date(user.created_at).toLocaleDateString()}
                                />
                                <InfoCard
                                    label="Name"
                                    value={user.user_metadata?.name || 'N/A'}
                                />
                                <InfoCard
                                    label="Email Verified"
                                    value={user.user_metadata?.email_verified ? 'Yes' : 'No'}
                                />
                                <InfoCard
                                    label="Is Active"
                                    value={user.is_active ? 'Yes' : 'No'}
                                />

                                <div className="col-span-1 md:col-span-2">
                                    <InfoCard
                                        label="Selected Dates"
                                        value={selectedDates.length > 0
                                            ? selectedDates.map(date =>
                                                new Date(date.date).toLocaleDateString()
                                            ).join(', ')
                                            : 'No dates selected'
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoCard = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
        <div className="text-gray-900 break-words">{value}</div>
    </div>
);

export default UserDetails;