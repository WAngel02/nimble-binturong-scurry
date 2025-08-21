import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, addDays, subDays, startOfWeek, eachDayOfInterval, isSameDay, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TimeSelectorProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date) => void;
  selectedTime: string | undefined;
  onTimeChange: (time: string) => void;
}

const generateTimeSlots = () => {
  const slots = [];
  for (let i = 9; i <= 17; i++) {
    slots.push(`${String(i).padStart(2, '0')}:00`);
    if (i < 17) {
      slots.push(`${String(i).padStart(2, '0')}:30`);
    }
  }
  return slots;
};

const TimeSelector = ({ selectedDate, onDateChange, selectedTime, onTimeChange }: TimeSelectorProps) => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const timeSlots = generateTimeSlots();

  const start = startOfWeek(displayDate, { weekStartsOn: 1 });
  const end = addDays(start, 6);
  const weekDays = eachDayOfInterval({ start, end });

  const handleNextWeek = () => setDisplayDate(addDays(displayDate, 7));
  const handlePrevWeek = () => setDisplayDate(subDays(displayDate, 7));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Elige fecha y hora</h3>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold text-center">
              {format(displayDate, "MMMM yyyy", { locale: es })}
            </div>
            <Button variant="ghost" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {weekDays.map((day) => (
              <div key={day.toString()} className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">
                  {format(day, "eee", { locale: es })}
                </p>
                <Button
                  variant={isSameDay(day, selectedDate || new Date(0)) ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "rounded-full w-10 h-10",
                    isSameDay(day, new Date()) && "border-primary",
                    isPast(day) && !isSameDay(day, new Date()) && "text-muted-foreground opacity-50"
                  )}
                  onClick={() => onDateChange(day)}
                  disabled={isPast(day) && !isSameDay(day, new Date())}
                >
                  {format(day, "d")}
                </Button>
              </div>
            ))}
          </div>
          {selectedDate && (
            <div>
              <h4 className="text-sm font-medium mb-2">Horarios disponibles</h4>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => onTimeChange(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeSelector;