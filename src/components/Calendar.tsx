import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Calendar = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentDate] = useState(new Date());
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user data using Supabase from shared client
  useEffect(() => {
  const fetchUser = async () => {
    try {
      setIsLoading(true);

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error('No active session');
      }

      // Just use the session user id directly
      setUserId(session.user.id);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);

      if (retryCount < 3) {
        console.log(`Retrying... Attempt ${retryCount + 1} of 3`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchUser(), 1000 * (retryCount + 1));
      } else {
        setIsLoading(false);
        setShowAlert(true);
        setAlertMessage(`Error loading user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  fetchUser();
}, [retryCount]);

  const handleSubmit = async () => {
    if (!userId) {
      setShowAlert(true);
      setAlertMessage('User not authenticated');
      return;
    }

    try {
  // Save dates to Supabase
  const { error } = await supabase
    .from('calendar_dates')  // replace with your actual table name
    .insert(
      selectedDates.map(date => ({
        user_id: userId,
        date: date.toISOString().split('T')[0],
        created_at: new Date().toISOString()
      }))
    );

  if (error) throw error;

  setShowAlert(true);
  setAlertMessage('Dates saved successfully');
  setTimeout(() => setShowAlert(false), 3000);
} catch (error) {
  console.error('Error saving dates:', error);
  setShowAlert(true);
  setAlertMessage(`Error saving dates: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
  };

  // Calendar generation code remains the same
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

  const handleDateSelect = (day: number | null) => {
  if (!day) return;

  const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

  if (selectedDates.some(date =>
      date.getDate() === day &&
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
  )) {
    setSelectedDates(selectedDates.filter(date =>
        !(date.getDate() === day &&
            date.getMonth() === currentDate.getMonth() &&
            date.getFullYear() === currentDate.getFullYear())
    ));
  } else if (selectedDates.length >= 6) {
    setShowAlert(true);
    setAlertMessage('Maximum 6 days can be selected');
    setTimeout(() => setShowAlert(false), 3000);
  } else {
    setSelectedDates([...selectedDates, selectedDate]);
  }
};

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Don't render until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
        <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-lg">
          <div className="text-center text-gray-600">Loading user data...</div>
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
                  onClick={() => handleDateSelect(day)}
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

        <div className="mt-4">
          <p className="mb-2 text-sm text-gray-600">
            Selected dates: {selectedDates.length}/6
          </p>
          <button
              onClick={handleSubmit}
              disabled={selectedDates.length === 0 || !userId}
              className={`
            w-full py-2 px-4 rounded-md font-medium transition-colors duration-200
            ${(selectedDates.length === 0 || !userId)
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
          `}
          >
            Submit Dates
          </button>
        </div>
      </div>
  );
};

export default Calendar;