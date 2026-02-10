import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';

type AvailabilityRule = {
  id: string;
  package_id: string;
  availability_type: 'always' | 'date_range' | 'specific_dates' | 'always_except';
  start_date?: string | null;
  end_date?: string | null;
  excluded_weekdays?: number[];
  specific_dates?: string[];
  is_open: boolean;
};

type Props = {
  availability: AvailabilityRule | null;
  onDateSelect?: (date: Date | Date[] | { from: Date; to?: Date } | undefined) => void;
  selectedDates?: Date | Date[] | { from: Date; to?: Date };
  mode?: 'single' | 'multiple' | 'range';
  showInstructions?: boolean;
  isAdminView?: boolean;
};

export function countAvailableDays(availability: AvailabilityRule | null, startDate: Date, endDate: Date): number {
  if (!availability || !availability.is_open) return 0;
  
  let count = 0;
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  while (current <= end) {
    const { availability_type, start_date, end_date: av_end_date, excluded_weekdays, specific_dates } = availability;
    let isAvailable = false;
    
    switch (availability_type) {
      case 'always': {
        isAvailable = true;
        break;
      }
        
      case 'date_range': {
        if (start_date && av_end_date) {
          const dateStr = format(current, 'yyyy-MM-dd');
          const startStr = format(new Date(start_date), 'yyyy-MM-dd');
          const endStr = format(new Date(av_end_date), 'yyyy-MM-dd');
          isAvailable = dateStr >= startStr && dateStr <= endStr;
        }
        break;
      }
        
      case 'specific_dates': {
        if (specific_dates && specific_dates.length > 0) {
          const dateStr = format(current, 'yyyy-MM-dd');
          isAvailable = specific_dates.some(d => {
            const specificDateStr = format(new Date(d), 'yyyy-MM-dd');
            return specificDateStr === dateStr;
          });
        }
        break;
      }
        
      case 'always_except': {
        if (!excluded_weekdays || excluded_weekdays.length === 0) {
          isAvailable = true;
        } else {
          const dayOfWeek = current.getDay();
          isAvailable = !excluded_weekdays.includes(dayOfWeek);
        }
        break;
      }
    }
    
    if (isAvailable) count++;
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

export function AvailabilityCalendar({ availability, onDateSelect, selectedDates, mode = 'single', showInstructions = false, isAdminView = false }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateAvailable = (date: Date): boolean => {
    if (!availability || !availability.is_open) return false;
    if (date < today) return false;

    const { availability_type, start_date, end_date, excluded_weekdays, specific_dates } = availability;

    switch (availability_type) {
      case 'always': {
        return true;
      }

      case 'date_range': {
        if (!start_date || !end_date) return false;
        const dateStr = format(date, 'yyyy-MM-dd');
        const startStr = format(new Date(start_date), 'yyyy-MM-dd');
        const endStr = format(new Date(end_date), 'yyyy-MM-dd');
        return dateStr >= startStr && dateStr <= endStr;
      }

      case 'specific_dates': {
        if (!specific_dates || specific_dates.length === 0) return false;
        const dateStr = format(date, 'yyyy-MM-dd');
        return specific_dates.some(d => {
          const specificDateStr = format(new Date(d), 'yyyy-MM-dd');
          return specificDateStr === dateStr;
        });
      }

      case 'always_except': {
        if (!excluded_weekdays || excluded_weekdays.length === 0) return true;
        const dayOfWeek = date.getDay();
        return !excluded_weekdays.includes(dayOfWeek);
      }

      default:
        return false;
    }
  };

  const disabledDays = (date: Date) => {
    if (date < today) return true;
    if (!availability) return true;
    return !isDateAvailable(date);
  };

  const modifiers = {
    available: (date: Date) => isDateAvailable(date),
  };

  const modifiersClassNames = {
    available: 'bg-green-100 text-green-900 hover:bg-green-200',
  };

  return (
    <div className="availability-calendar">
      <style>{`
        .availability-calendar .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #dc2626;
          --rdp-background-color: #fee2e2;
          font-family: inherit;
        }
        .availability-calendar .rdp-months {
          justify-content: center;
        }
        .availability-calendar .rdp-month {
          background: white;
          border-radius: 12px;
          padding: 1rem;
        }
        .availability-calendar .rdp-caption {
          display: flex;
          justify-content: center;
          padding: 1rem 0;
          font-weight: 600;
          font-size: 1rem;
          color: #1f2937;
        }
        .availability-calendar .rdp-head_cell {
          font-weight: 600;
          font-size: 0.875rem;
          color: #6b7280;
          text-transform: uppercase;
        }
        .availability-calendar .rdp-cell {
          padding: 2px;
        }
        .availability-calendar .rdp-day {
          border-radius: 8px;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .availability-calendar .rdp-day:hover:not(.rdp-day_disabled) {
          background-color: #fef2f2;
        }
        .availability-calendar .rdp-day_selected {
          background-color: #dc2626 !important;
          color: white !important;
          font-weight: 600;
        }
        .availability-calendar .rdp-day_disabled {
          opacity: 0.3;
        }
        .availability-calendar .rdp-nav_button {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .availability-calendar .rdp-nav_button:hover {
          background-color: #f3f4f6;
        }
      `}</style>
      {showInstructions && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            {mode === 'range' ? (
              <><strong>Select your dates:</strong> Click the start date, then click the end date to select a range. Green dates are available for booking.</>
            ) : mode === 'multiple' ? (
              <><strong>Select dates:</strong> Click each date you want to book. Green dates are available.</>
            ) : (
              <><strong>Select a date:</strong> Click any green date to select it for booking.</>
            )}
          </p>
        </div>
      )}
      <DayPicker
        mode={mode as any}
        selected={selectedDates as any}
        onSelect={onDateSelect as any}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        fromDate={today}
        numberOfMonths={isAdminView ? 2 : 1}
        disabled={disabledDays}
      />
    </div>
  );
}
