import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const AdminCalendar = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month');
    const [selectedDate, setSelectedDate] = useState(null);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleDateClick = (day) => {
        if (!day) return;
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        newDate.setHours(12, 0, 0, 0);
        setSelectedDate(newDate);
        navigate(`/admin/calendar/${newDate.toISOString().split('T')[0]}`);
    };

    const handleMonthChange = (offset) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const handleTodayClick = () => {
        setCurrentDate(new Date());
    };

    const isToday = (day) => {
        if (!day) return false;
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day) => {
        if (!day || !selectedDate) return false;
        return (
            day === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear()
        );
    };

    const calendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDay = firstDayOfMonth.getDay();

        const days = [];
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        const weeks = [];
        let week = [];
        days.forEach(day => {
            week.push(day);
            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        });
        if (week.length > 0) {
            while (week.length < 7) {
                week.push(null);
            }
            weeks.push(week);
        }

        return weeks;
    }, [currentDate]);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <div className="flex items-center space-x-2">
                                <Select
                                    value={view}
                                    onValueChange={setView}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Select view" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="month">Month</SelectItem>
                                        <SelectItem value="week">Week</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={handleTodayClick}
                                className="px-4"
                            >
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleMonthChange(-1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleMonthChange(1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-7 gap-4 mb-4">
                        {dayNamesShort.map(day => (
                            <div key={day} className="text-center font-semibold text-gray-600">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {calendarGrid.map((week, weekIndex) => (
                            <div key={weekIndex} className="grid grid-cols-7 gap-4">
                                {week.map((day, dayIndex) => (
                                    <div
                                        key={`${weekIndex}-${dayIndex}`}
                                        onClick={() => handleDateClick(day)}
                                        className={cn(
                                            "min-h-24 p-2 rounded-lg border transition-all duration-200",
                                            !day && "invisible",
                                            day && "hover:border-blue-500 cursor-pointer",
                                            isToday(day) && "bg-blue-50 border-blue-200",
                                            isSelected(day) && "border-blue-500 bg-blue-50",
                                            "border-gray-200"
                                        )}
                                    >
                                        {day && (
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={cn(
                                                    "text-sm font-medium",
                                                    isToday(day) && "text-blue-600",
                                                    isSelected(day) && "text-blue-700",
                                                    !isToday(day) && !isSelected(day) && "text-gray-700"
                                                )}>
                                                    {day}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCalendar;