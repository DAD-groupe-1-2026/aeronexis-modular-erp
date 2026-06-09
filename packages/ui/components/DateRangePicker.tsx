import { useState, useRef, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../utils/cn';
import 'react-day-picker/dist/style.css'; // Includes basic styles

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
}

export function DateRangePicker({ value, onChange, className, placeholder = "Sélectionner une période" }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateRange = (range?: DateRange) => {
    if (range?.from) {
      if (range.to) {
        return `${format(range.from, 'dd LLL yyyy', { locale: fr })} - ${format(range.to, 'dd LLL yyyy', { locale: fr })}`;
      }
      return format(range.from, 'dd LLL yyyy', { locale: fr });
    }
    return placeholder;
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-left shadow-sm transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
          !value?.from && "text-slate-500",
          value?.from && "text-white"
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
        <span className="truncate">{formatDateRange(value)}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-3 rounded-2xl border border-white/10 bg-[#0a0a0c]/95 backdrop-blur-3xl shadow-2xl">
          <style>{`
            .rdp {
              --rdp-cell-size: 40px;
              --rdp-accent-color: rgb(99, 102, 241); /* indigo-500 */
              --rdp-background-color: rgba(99, 102, 241, 0.1);
              --rdp-accent-color-dark: rgb(99, 102, 241);
              --rdp-background-color-dark: rgba(99, 102, 241, 0.1);
              --rdp-outline: 2px solid var(--rdp-accent-color);
              margin: 0;
            }
            .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
              background-color: var(--rdp-accent-color);
              color: white;
            }
            .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
              background-color: rgba(255, 255, 255, 0.1);
            }
            .rdp-day { color: #cbd5e1; }
            .rdp-head_cell { color: #64748b; font-weight: 500; font-size: 0.8rem; text-transform: uppercase; }
            .rdp-caption_label { color: white; font-weight: 600; }
            .rdp-nav_button { color: #cbd5e1; }
            .rdp-nav_button:hover { background-color: rgba(255, 255, 255, 0.1); }
          `}</style>
          <DayPicker
            mode="range"
            selected={value}
            onSelect={onChange}
            locale={fr}
            numberOfMonths={2}
            showOutsideDays
          />
        </div>
      )}
    </div>
  );
}
