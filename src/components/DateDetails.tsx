import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Alert, AlertDescription } from '../components/ui/alert';

// Types
interface DateDetailsType {
    details: string;
    id: string;
    user_id: string;
}

interface UserType {
    id: string;
    email: string;
    user_metadata?: {
        name?: string;
    };
}

interface CalendarDateType {
    date: string;
    id: string;
    user_id: string;
}

// Custom hook for data fetching
const useDateDetailsData = (date: string | undefined) => {
    const [dateDetails, setDateDetails] = useState<DateDetailsType | null>(null);
    const [users, setUsers] = useState<UserType[]>([]);
    const [calendarDates, setCalendarDates] = useState<CalendarDateType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDateDetails = async () => {
            if (!date) {
                setError('No date provided');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                // Fetch date details
                const { data: dateData, error: dateError } = await supabase
                    .from('calendar_dates')
                    .select('*')
                    .eq('date', date)
                    .single();

                if (dateError) throw new Error(dateError.message);
                setDateDetails(dateData);

                // Fetch users
                const { data: usersData, error: usersError } = await supabase
                    .rpc('get_users_by_date', { target_date: date });

                if (usersError) throw new Error(usersError.message);
                setUsers(usersData || []);

                // Fetch calendar dates if we have users
                if (usersData?.length > 0) {
                    const userIds = usersData.map((user: UserType) => user.id);
                    const { data: calendarDatesData, error: calendarDatesError } = await supabase
                        .from('calendar_dates')
                        .select('*')
                        .in('user_id', userIds);

                    if (calendarDatesError) throw new Error(calendarDatesError.message);
                    setCalendarDates(calendarDatesData || []);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDateDetails();
    }, [date]);

    return { dateDetails, users, calendarDates, isLoading, error };
};

// Components
const LoadingState = () => (
    <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
);

const ErrorState = ({ message }: { message: string }) => (
    <Alert variant="destructive" className="my-4">
        <AlertDescription>{message}</AlertDescription>
    </Alert>
);

const UsersList = ({ users }: { users: UserType[] }) => (
    <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Users who have chosen this date:</h3>
        {users.length === 0 ? (
            <p className="text-gray-600">No users have selected this date yet.</p>
        ) : (
            <ul className="space-y-2">
                {users.map((user: UserType) => (
                    <li key={user.id} className="py-1">
                        {user.user_metadata?.name || user.email}
                    </li>
                ))}
            </ul>
        )}
    </div>
);

const DatesList = ({ dates }: { dates: CalendarDateType[] }) => (
    <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Dates chosen by these users:</h3>
        {dates.length === 0 ? (
            <p className="text-gray-600">No dates available.</p>
        ) : (
            <ul className="space-y-2">
                {dates.map((calendarDate, index) => (
                    <li key={`${calendarDate.date}-${index}`} className="py-1">
                        {new Date(calendarDate.date).toLocaleDateString()}
                    </li>
                ))}
            </ul>
        )}
    </div>
);

function DateDetails() {
    const { date } = useParams<{ date: string }>();
    const { dateDetails, users, calendarDates, isLoading, error } = useDateDetailsData(date);

    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;
    if (!dateDetails) return <ErrorState message="No details available for this date." />;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">
                Date Details for {new Date(date!).toLocaleDateString()}
            </h2>

            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-700">{dateDetails.details}</p>

                <UsersList users={users} />
                <DatesList dates={calendarDates} />
            </div>
        </div>
    );
}

export default DateDetails;