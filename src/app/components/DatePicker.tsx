import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  selectedDate: string; // Format: YYYY-MM-DD
  onDateSelect: (date: string) => void;
  label: string;
  minDate?: Date; // Fecha mínima permitida
  maxDate?: Date; // Fecha máxima permitida
}

export function DatePicker({ selectedDate, onDateSelect, label, minDate, maxDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  // Inicializar currentMonth basado en selectedDate si existe
  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate + 'T00:00:00');
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Domingo

    const days: (number | null)[] = [];

    // Agregar espacios vacíos para los días antes del primer día del mes
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Agregar los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (minDate && date < minDate) {
      return true;
    }
    
    if (maxDate && date > maxDate) {
      return true;
    }
    
    return false;
  };

  const handleDayClick = (day: number) => {
    if (isDateDisabled(day)) return;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    
    // Format as YYYY-MM-DD
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(formattedDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Seleccionar fecha';
    const date = new Date(dateString + 'T00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isSelectedDay = (day: number) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate + 'T00:00:00');
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#8B1538] outline-none text-sm transition-colors text-left bg-white"
      >
        {formatDisplayDate(selectedDate)}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[70]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Calendar Popup - Centered */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-[71] w-[280px]">
            {/* Month/Year Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                {monthNames[currentMonth.getMonth()].substring(0, 3).toUpperCase()}, {currentMonth.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day, index) => (
                <div
                  key={index}
                  className="text-center text-xs font-semibold text-gray-500 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const disabled = isDateDisabled(day);
                const selected = isSelectedDay(day);
                const today = isToday(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    disabled={disabled}
                    className={`
                      aspect-square rounded-full text-sm font-medium transition-all
                      ${disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                      ${selected ? 'bg-[#8B1538] text-white hover:bg-[#6b0f2a]' : 'text-gray-700'}
                      ${today && !selected ? 'border-2 border-[#8B1538]' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}