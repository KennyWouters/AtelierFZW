import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.ts';
import { useNavigate } from 'react-router-dom';
import TimeSelectPanel from '../components/TimeSelectPanel';

const Calendar = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedDates] = useState<Date[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) throw new Error('No active session');
        setUserId(session.user.id);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchUser(), 1000 * (retryCount + 1));
        } else {
          setIsLoading(false);
          setShowAlert(true);
          setAlertMessage(`Erreur de chargement des données utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      }
    };
    fetchUser();
  }, [retryCount]);

  const calculateTwoWeekRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysSinceMonday = (today.getDay() + 6) % 7;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysSinceMonday);

    const endDate = new Date(lastMonday);
    endDate.setDate(lastMonday.getDate() + 13);

    return { startDate: lastMonday, endDate };
  };

  const handleSubmit = async () => {
    if (!userId) {
      setShowAlert(true);
      setAlertMessage('Utilisateur non authentifié');
      return;
    }

    try {
      const { error } = await supabase
          .from('calendar_dates')
          .insert(
              selectedDates.map(date => ({
                user_id: userId,
                date: date.toISOString().split('T')[0],
                created_at: new Date().toISOString()
              }))
          );

      if (error) throw error;
      setShowAlert(true);
      setAlertMessage('Dates enregistrées avec succès');
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des dates:', error);
      setShowAlert(true);
      setAlertMessage(`Erreur lors de l'enregistrement des dates: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const generateCalendarDays = () => {
    const days = [];
    const { startDate, endDate } = calculateTwoWeekRange();
    let currentDay = new Date(startDate);

    while (currentDay <= endDate) {
      const dayOfWeek = currentDay.getDay();
      const isFirstSaturday = dayOfWeek === 6 && currentDay.getDate() <= 7;
      const isSelectable = (dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6) && !isFirstSaturday;
      days.push({
        day: currentDay.getDate(),
        month: currentDay.getMonth(),
        year: currentDay.getFullYear(),
        isSelectable,
        isToday: currentDay.toDateString() === new Date().toDateString(),
        date: new Date(currentDay)
      });
      currentDay.setDate(currentDay.getDate() + 1);
    }
    return days;
  };

  const handleDateSelect = (day: {
    day: number;
    month: number;
    year: number;
    isSelectable: boolean;
    isToday: boolean;
    date: Date
  }) => {
    if (!day || !day.isSelectable) return;
    const selectedDate = new Date(day.year, day.month, day.day);
    setSelectedDate(selectedDate);
    setIsPanelOpen(true);
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  if (!mounted) return null;

  if (isLoading) {
    return (
        <div className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" />
            <div className="text-gray-600">Chargement du calendrier...</div>
          </div>
        </div>
    );
  }

  const days = generateCalendarDays();
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  const dateRange = firstDay.month === lastDay.month
      ? `${monthNames[firstDay.month]} ${firstDay.year}`
      : `${monthNames[firstDay.month]} - ${monthNames[lastDay.month]} ${lastDay.year}`;

  const handleTimeSelect = (time) => {
    console.log('Heure sélectionnée:', time);
    // Handle the selected time
  };

  return (
      <div className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-lg">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            {dateRange}
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Sélectionnez les dates disponibles pour les deux prochaines semaines
          </p>
        </div>

        {showAlert && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                alertMessage.includes('Erreur')
                    ? 'bg-red-50 border-2 border-red-200 text-red-700'
                    : 'bg-green-50 border-2 border-green-200 text-green-700'
            }`}>
              {alertMessage.includes('Erreur') ? (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{alertMessage}</p>
            </div>
        )}

        <div className="grid grid-cols-7 gap-2 mb-6">
          {dayNames.map(day => (
              <div key={day} className="text-center font-semibold p-2 text-gray-600">
                {day}
              </div>
          ))}

          {days.map((day, index) => (
              <div
                  key={index}
                  onClick={() => handleDateSelect(day)}
                  className={`
              relative p-3 text-center rounded-lg transition-all duration-200
              ${day.isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              ${day.isSelectable
                      ? 'hover:bg-blue-50 cursor-pointer bg-blue-50/50 hover:scale-105 transform'
                      : 'bg-gray-100 cursor-not-allowed opacity-50'}
              ${selectedDates.some(date =>
                      date.getDate() === day.day &&
                      date.getMonth() === day.month &&
                      date.getFullYear() === day.year
                  ) ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-800'}
            `}
              >
                <span className="text-lg font-medium">{day.day}</span>
                {day.isSelectable && (
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
                )}
              </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Les dates disponibles sont surlignées en bleu (Jeu-Sam)
          </p>
          <button
              onClick={handleSubmit}
              disabled={selectedDates.length === 0 || !userId}
              className={`
            w-full py-3 px-4 rounded-lg font-medium text-lg transition-all duration-200
            ${(selectedDates.length === 0 || !userId)
                  ? 'bg-gray-200 cursor-not-allowed text-gray-500'
                  : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
              }
          `}
          >
            Confirmer la sélection
          </button>
        </div>

        <TimeSelectPanel
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
            selectedDate={selectedDate ? selectedDate.toDateString() : ''}
            onTimeSelect={handleTimeSelect}
        />
      </div>
  );
};

export default Calendar;