import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SelectTime = () => {
    const { date } = useParams<{ date?: string }>();
    const navigate = useNavigate();
    const [fromTime, setFromTime] = useState<string | null>(null);
    const [toTime, setToTime] = useState<string | null>(null);

    const generateTimeSlots = (isFrom: boolean, minTime?: string) => {
        const slots = [];
        const endHour = isFrom ? 18 : 19;
        for (let hour = 14; hour < endHour; hour++) {
            slots.push(`${hour}:00`);
            slots.push(`${hour}:30`);
        }
        if (!isFrom) {
            slots.push('19:00');
        } else {
            slots.push('18:30');
        }
        return minTime ? slots.filter(time => time > minTime) : slots;
    };

    const fromTimeSlots = generateTimeSlots(true);
const toTimeSlots = generateTimeSlots(false, fromTime ?? undefined);
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formattedDate = date ? formatDate(date) : '...';

    const handleSubmit = () => {
        if (!fromTime || !toTime) {
            alert('Veuillez sélectionner les heures de début et de fin.');
            return;
        }

        const start = new Date(`1970-01-01T${fromTime}:00`);
        const end = new Date(`1970-01-01T${toTime}:00`);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60);

        if (diff < 30) {
            alert('Veuillez sélectionner une plage horaire d\'une durée minimale de 30 minutes.');
            return;
        }

        console.log(`Plage horaire sélectionnée : ${fromTime} - ${toTime} le ${date}`);
        navigate('/'); // Rediriger vers une autre page après la soumission
    };

    return (
        <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sélectionnez l'heure pour {formattedDate}</h2>
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">De :</h3>
                <div className="grid grid-cols-3 gap-4">
                    {fromTimeSlots.map(time => (
                        <button
                            key={time}
                            onClick={() => setFromTime(time)}
                            className={`py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                                fromTime === time ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">À :</h3>
                <div className="grid grid-cols-3 gap-4">
                    {toTimeSlots.map(time => (
                        <button
                            key={time}
                            onClick={() => setToTime(time)}
                            className={`py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                                toTime === time ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>
            <button
                onClick={handleSubmit}
                className="w-full py-2 px-4 rounded-md font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
            >
                {`Réserver l'atelier de ${fromTime ?? '...'} à ${toTime ?? '...'} le ${formattedDate}`}
            </button>
        </div>
    );
};

export default SelectTime;