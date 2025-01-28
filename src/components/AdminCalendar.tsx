// src/components/AdminCalendar.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AdminCalendar = () => {
    const [mounted, setMounted] = useState(false);
    const [selectedDates, setSelectedDates] = useState([]);
    const [currentDate] = useState(new Date());
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const navigate = useNavigate();

    // Handle hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch all users' calendar data using Supabase from shared client
    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
                setIsLoading(true);

                // Fetch all calendar dates
                const { data, error } = await supabase
                    .from('calendar_dates')  // replace with your actual table name
                    .select('*');

                if (error) throw error;

                // Process data as needed
                setSelectedDates(data.map(entry => new Date(entry.date)));
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching calendar data:', error);

                if (retryCount < 3) {
                    console.log(`Retrying... Attempt ${retryCount + 1} of 3`);
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => fetchCalendarData(), 1000 * (retryCount + 1));
                } else {
                    setIsLoading(false);
                    setShowAlert(true);
                    setAlertMessage(`Error loading calendar data: ${error.message}`);
                }
            }
        };

        fetchCalendarData();
    }, [retryCount]);

    const handleDateClick = (day) => {
        if (!day) return;

        const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        selectedDate.setHours(12, 0, 0, 0); // Set time to noon to avoid time zone issues
        navigate(`/admin/calendar/${selectedDate.toISOString().split('T')[0]}`);
    };

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDay = firstDayOfMonth.getDay();

    const generateCalendarDays = () => {
        const days = [];
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }
        return days;
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (!mounted) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-lg">
                <div className="text-center text-gray-600">Loading calendar data...</div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-lg">
            <div className="mb-4 text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
            </div>

            {showAlert && (
                <div className={`mb-4 p-4 rounded-md flex items-center gap-2 ${
                    alertMessage.includes('Error')
                        ? 'bg-red-50 border border-red-200 text-red-600'
                        : 'bg-green-50 border border-green-200 text-green-600'
                }`}>
                    {alertMessage.includes('Error') ? (
                        <AlertCircle className="h-5 w-5" />
                    ) : (
                        <CheckCircle className="h-5 w-5" />
                    )}
                    <p className="text-sm">{alertMessage}</p>
                </div>
            )}

            <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map(day => (
                    <div key={day} className="text-center font-semibold p-2 text-gray-600">
                        {day}
                    </div>
                ))}

                {generateCalendarDays().map((day, index) => (
                    <div
                        key={index}
                        onClick={() => handleDateClick(day)}
                        className={`
                            p-2 text-center cursor-pointer rounded transition-colors duration-200
                            ${!day ? 'invisible' : 'hover:bg-gray-100'}
                            ${selectedDates.some(date =>
                            date.getDate() === day &&
                            date.getMonth() === currentDate.getMonth() &&
                            date.getFullYear() === currentDate.getFullYear()
                        ) ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-700'}
                        `}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminCalendar;