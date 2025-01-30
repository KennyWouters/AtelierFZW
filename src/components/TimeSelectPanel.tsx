import { useState, useEffect } from 'react';
import { X, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

interface TimeSelectPanelProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string;
    onTimeSelect: (timeSlotData: { startTime: string; endTime: string }) => void;
    userId: string;
    onError: (error: string) => void;
}

const TimeSelectPanel = ({
                             isOpen,
                             onClose,
                             selectedDate,
                             onTimeSelect,
                             userId,
                             onError
                         }: TimeSelectPanelProps) => {
    const [step, setStep] = useState('start');
    const [tempStartTime, setTempStartTime] = useState('14:00');
    const [startTime, setStartTime] = useState<string | null>(null);
    const [endTime, setEndTime] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Function to record time slot in database
    const recordTimeSlot = async (timeSlotData: { startTime: string; endTime: string }) => {
        try {
            const response = await fetch('/api/timeslots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    date: selectedDate,
                    startTime: timeSlotData.startTime,
                    endTime: timeSlotData.endTime,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to record time slot');
            }

            return await response.json();
        } catch (error) {
            throw new Error('Error recording time slot: ' + (error as Error).message);
        }
    };

    const handleConfirm = async () => {
        if (step === 'start') {
            setStartTime(tempStartTime);
            setEndTime(null);
            setStep('end');
        } else {
            setIsSubmitting(true);
            try {
                // Prepare the time slot data
                const timeSlotData = {
                    startTime: startTime!,
                    endTime: endTime!
                };

                // First record in database
                await recordTimeSlot(timeSlotData);

                // If successful, call the onTimeSelect callback
                onTimeSelect?.(timeSlotData);
                onClose();
            } catch (error) {
                onError?.((error as Error).message);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // Rest of the component logic remains the same
    const generateTimeSlots = (minTime: string | null) => {
    const slots = [];
    const [minHour, minMinute] = minTime ? minTime.split(':').map(Number) : [14, 0];

    for (let hour = minHour; hour <= 19; hour++) {
        for (const minute of ['00', '30']) {
            if (hour === minHour && Number(minute) < minMinute) continue;
            if (hour === 19 && minute === '30') continue;

            const time = `${String(hour).padStart(2, '0')}:${minute}`;
            slots.push(time);
        }
    }
    return slots;
};

    const formatTime = (time: string | null) => {
        if (!time) return '';
        const [hour, minute] = time.split(':');
        const hour12 = Number(hour) % 12 || 12;
        return `${hour12}:${minute} ${Number(hour) >= 12 ? 'PM' : 'AM'}`;
    };

    const handleTimeSelect = (time: string) => {
        if (step === 'start') {
            setTempStartTime(time);
        } else {
            setEndTime(time);
        }
    };

    const handleBack = () => {
        setStep('start');
        setEndTime(null);
    };

    useEffect(() => {
        if (!isOpen) {
            setStep('start');
            setEndTime(null);
        }
    }, [isOpen]);

    const timeSlots = generateTimeSlots(step === 'end' ? startTime : null);

    return (
        <div className={`fixed inset-0 z-40 flex items-center justify-center ${isOpen ? 'visible' : 'invisible'}`}>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />
            )}

            <div
                className={`relative bg-white w-full sm:w-96 max-w-lg rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
                    isOpen ? 'translate-y-0' : 'translate-y-full'
                }`}
            >
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Select {step === 'start' ? 'Start' : 'End'} Time
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex items-center text-sm text-gray-600 space-x-2">
                            <span className={step === 'start' ? 'text-blue-600 font-medium' : ''}>
                                {tempStartTime ? formatTime(tempStartTime) : 'Start Time'}
                            </span>
                            <ArrowRight className="h-4 w-4" />
                            <div className="flex items-center">
                                {step === 'end' && (
                                    <button
                                        onClick={handleBack}
                                        className="mr-2 p-1 hover:bg-gray-100 rounded-full"
                                    >
                                        <ArrowLeft className="h-4 w-4 text-blue-500" />
                                    </button>
                                )}
                                <span className={step === 'end' ? 'text-blue-600 font-medium' : ''}>
                                    {endTime ? formatTime(endTime) : 'End Time'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-2">
                            {timeSlots.map((time) => {
                                const isSelected = step === 'start' ? time === tempStartTime : time === endTime;
                                const isDisabled = step === 'end' && time <= startTime!;

                                return (
                                    <button
                                        key={time}
                                        onClick={() => !isDisabled && handleTimeSelect(time)}
                                        disabled={isDisabled}
                                        className={`w-full p-4 rounded-lg flex items-center justify-between transition-colors ${
                                            isSelected
                                                ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                                                : isDisabled
                                                    ? 'opacity-50 cursor-not-allowed bg-gray-50'
                                                    : 'hover:bg-gray-50 border-2 border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Clock className={`h-5 w-5 ${
                                                isSelected ? 'text-blue-500' : 'text-gray-400'
                                            }`} />
                                            <span className="font-medium">{formatTime(time)}</span>
                                        </div>
                                        {isSelected && (
                                            <div className="h-3 w-3 bg-blue-500 rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-4 border-t">
                        <button
                            onClick={handleConfirm}
                            disabled={(step === 'end' && !endTime) || isSubmitting}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2
                                ${(step === 'end' && !endTime) || isSubmitting
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                        >
                            {isSubmitting ? (
                                <span>Recording...</span>
                            ) : step === 'start' ? (
                                <span>Confirm Start Time: {formatTime(tempStartTime)}</span>
                            ) : (
                                <span>Confirm Time Slot</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeSelectPanel;