import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

import { Users, Calendar, ShieldCheck } from 'lucide-react';

interface User {
    id: string;
    email: string;
    created_at: string;
    user_metadata: {
        name?: string;
        email_verified?: boolean;
    };
    is_active: boolean;
}

interface UserWithRole extends User {
    roles?: {
        is_admin: boolean;
    };
    selectedDates?: string[];
}

interface FetchState {
    loading: boolean;
    error: string | null;
}

const ITEMS_PER_PAGE = 10;

const UserManagement = () => {
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [fetchState, setFetchState] = useState<FetchState>({
        loading: false,
        error: null
    });
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        const retryCount = 3;
        let attempt = 0;

        while (attempt < retryCount) {
            try {
                setFetchState(prev => ({ ...prev, loading: true, error: null }));

                // First get users from auth.users
                const { data: { users: authUsers }, error: usersError } = await supabase.auth.admin.listUsers({
                    page: page,
                    perPage: ITEMS_PER_PAGE
                });

                if (usersError) throw usersError;

                // Get user IDs for further queries
                const userIds = authUsers.map(user => user.id);

                // Get roles for these users
                const { data: roles, error: rolesError } = await supabase
                    .from('user_roles')
                    .select('user_id, is_admin')
                    .in('user_id', userIds);

                if (rolesError) throw rolesError;

                // Get calendar dates for these users
                const { data: dates, error: datesError } = await supabase
                    .from('calendar_dates')
                    .select('user_id, date')
                    .in('user_id', userIds);

                if (datesError) throw datesError;

                // Combine all the data
                const transformedUsers: UserWithRole[] = authUsers.map(user => ({
                    ...user,
                    roles: roles?.find(role => role.user_id === user.id) || { is_admin: false },
                    selectedDates: dates
                        ?.filter(date => date.user_id === user.id)
                        ?.map(date => date.date) || []
                }));

                setUsers(transformedUsers);
                break;

            } catch (err) {
                attempt++;
                if (attempt === retryCount) {
                    setFetchState(prev => ({
                        ...prev,
                        error: `Failed to fetch users after ${retryCount} attempts. ${err instanceof Error ? err.message : ''}`
                    }));
                }
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            } finally {
                setFetchState(prev => ({ ...prev, loading: false }));
            }
        }
    }, [page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers, page]);

    const handleUserClick = (userId: string) => {
        navigate(`/admin/users/${userId}`);
    };

    if (fetchState.loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (fetchState.error) {
        return (
            <Alert variant="destructive" className="mx-4">
                <AlertDescription>{fetchState.error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <Users className="h-6 w-6 text-blue-500" />
                        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Selected Dates
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleUserClick(user.id)}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-500 font-medium">
                                                        {(user.user_metadata?.name || user.email)[0].toUpperCase()}
                                                    </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.user_metadata?.name || 'Unnamed User'}
                                            </div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                            {user.user_metadata?.email_verified && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        Verified
                                                    </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <ShieldCheck className={`h-4 w-4 mr-2 ${
                                            user.roles?.is_admin ? 'text-green-500' : 'text-gray-400'
                                        }`} />
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.roles?.is_admin
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                                {user.roles?.is_admin ? 'Admin' : 'User'}
                                            </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-500">
                                                {user.selectedDates?.length
                                                    ? user.selectedDates.length
                                                    : 'No'} dates selected
                                            </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            !user.banned_until
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {!user.banned_until ? 'Active' : 'Inactive'}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => page > 1 && setPage(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700
                                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {page}
                        </span>
                        <button
                            onClick={() => users.length === ITEMS_PER_PAGE && setPage(page + 1)}
                            disabled={users.length < ITEMS_PER_PAGE}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700
                                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;