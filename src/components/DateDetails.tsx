import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface DateDetailsType {
    details: string;
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
}

function DateDetails() {
    const { date } = useParams<{ date: string }>();
    const [dateDetails, setDateDetails] = useState<DateDetailsType | null>(null);
    const [users, setUsers] = useState<UserType[]>([]);
    const [calendarDates, setCalendarDates] = useState<CalendarDateType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDateDetails = async () => {
            try {
                setIsLoading(true);

                // Get date details and log the response
                const { data: dateData, error: dateError } = await supabase
                    .from('calendar_dates')
                    .select('*')
                    .eq('date', date)
                    .single();

                console.log('Date Details Response:', { dateData, dateError });

                if (dateError) throw dateError;
                setDateDetails(dateData);

                // Query users and log the response
                const { data: usersData, error: usersError } = await supabase
                    .rpc('get_users_by_date', { target_date: date });

                console.log('Users Response:', { usersData, usersError });

                if (usersError) throw usersError;
                setUsers(usersData || []);

                if (usersData?.length > 0) {
                    const userIds = usersData.map((user: { id: UserType; }) => user.id);
                    const { data: calendarDatesData, error: calendarDatesError } = await supabase
                        .from('calendar_dates')
                        .select('date')
                        .in('user_id', userIds);

                    console.log('Calendar Dates Response:', { calendarDatesData, calendarDatesError });

                    if (calendarDatesError) throw calendarDatesError;
                    setCalendarDates(calendarDatesData || []);
                }

                setIsLoading(false);
            } catch (error: unknown) {
    console.error('Error fetching data:', error);
    setError(error instanceof Error ? error.message : 'Unknown error');
    setIsLoading(false);
}
        };

        if (date) {
            fetchDateDetails();
        }
    }, [date]);

    // Add debugging logs for render
    console.log('Current State:', {
        dateDetails,
        users,
        calendarDates,
        isLoading,
        error
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!dateDetails) return <div>No details available for this date.</div>;

    return (
        <div>
            <h2>Date Details for {date}</h2>
            <pre>Debug: {JSON.stringify({ dateDetails, users }, null, 2)}</pre>
            <p>Details: {dateDetails.details}</p>
            <h3>Users who have chosen this date:</h3>
            <ul>
                {users.map((user: UserType) => (
    <li key={user.id}>
        {user.user_metadata?.name || user.email}
    </li>
))}
            </ul>
            <h3>Dates chosen by these users:</h3>
            <ul>
                {calendarDates.map((calendarDate, index) => (
                    <li key={`${calendarDate.date}-${index}`}>
                        {calendarDate.date}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DateDetails;