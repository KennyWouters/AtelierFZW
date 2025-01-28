import React, { useEffect, useState } from 'react';
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

function DateDetails() {  // Changed to function declaration
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

                const { data: dateData, error: dateError } = await supabase
                    .from('calendar_dates')
                    .select('*')
                    .eq('date', date)
                    .single();

                if (dateError) throw dateError;
                setDateDetails(dateData);

                const { data: usersData, error: usersError } = await supabase
                    .from('auth.users')
                    .select('id, email, user_metadata')
                    .eq('user_metadata->chosen_date', date);

                if (usersError) throw usersError;
                setUsers(usersData || []);

                if (usersData?.length > 0) {
                    const userIds = usersData.map(user => user.id);
                    const { data: calendarDatesData, error: calendarDatesError } = await supabase
                        .from('calendar_dates')
                        .select('date')
                        .in('user_id', userIds);

                    if (calendarDatesError) throw calendarDatesError;
                    setCalendarDates(calendarDatesData || []);
                }

                setIsLoading(false);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setError(error.message);
                setIsLoading(false);
            }
        };

        if (date) {
            fetchDateDetails();
        }
    }, [date]);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!dateDetails) return <div>No details available for this date.</div>;

    return (
        <div>
            <h2>Date Details for {date}</h2>
            <p>Details: {dateDetails.details}</p>
            <h3>Users who have chosen this date:</h3>
            <ul>
                {users.map(user => (
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

export default DateDetails;  // Make sure this line is present