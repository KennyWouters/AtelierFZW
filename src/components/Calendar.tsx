import React, { useState, useEffect } from 'react';

const CalendarSelector = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentDate] = useState(new Date());
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [userId, setUserId] = useState(null);

  // Fetch authenticated user on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        const data = await response.json();
        if (data.user?.id) {
          setUserId(data.user.id);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setShowAlert(true);
        setAlertMessage('Error loading user data');
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async () => {
    if (!userId) {
      setShowAlert(true);
      setAlertMessage('User not authenticated');
      return;
    }

    try {
      const response = await fetch('/api/calendar/dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          dates: selectedDates.map(date => date.toISOString().split('T')[0])
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save dates');
      }

      setShowAlert(true);
      setAlertMessage('Dates saved successfully');
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error saving dates:', error);
      setShowAlert(true);
      setAlertMessage('Error saving dates');
    }
  };

  // Rest of the existing calendar code...
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

  const handleDateSelect = (day) => {
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

  return (
      <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-lg">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>

        {showAlert && (
            <div className={`mb-4 p-4 rounded-md ${
                alertMessage.includes('Error')
                    ? 'bg-red-50 border border-red-200 text-red-600'
                    : 'bg-green-50 border border-green-200 text-green-600'
            }`}>
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

export default CalendarSelector;