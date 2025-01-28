// src/components/UserManagement.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface User {
    id: string;
    email: string;
    created_at: string;
    user_metadata: {
        name?: string;
    };
    is_active: boolean;
}

interface UserWithRole extends User {
    roles?: {
        is_admin: boolean;
    };
}

const UserManagement = () => {
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // First get all users
            const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

            if (usersError) throw usersError;

            // Then get their roles
            const userIds = users.map(user => user.id);
            const { data: roles, error: rolesError } = await supabase
                .from('user_roles')
                .select('user_id, is_admin')
                .in('user_id', userIds);

            if (rolesError) throw rolesError;

            // Combine users with their roles
            const usersWithRoles = users.map(user => ({
                ...user,
                roles: roles.find(role => role.user_id === user.id)
            }));

            setUsers(usersWithRoles);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (userId: string, updates: any) => {
        try {
            // If we're updating the admin status, update the user_roles table
            if ('isAdmin' in updates) {
                const { error: roleError } = await supabase
                    .from('user_roles')
                    .upsert({
                        user_id: userId,
                        is_admin: updates.isAdmin
                    });

                if (roleError) throw roleError;
            }

            // Refresh the users list
            fetchUsers();
            setIsEditing(false);
            setSelectedUser(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error updating user');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <ul>
                    {users.map(user => (
                        <li key={user.id}>
                            {user.email} - {user.roles?.is_admin ? 'Admin' : 'User'}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UserManagement;