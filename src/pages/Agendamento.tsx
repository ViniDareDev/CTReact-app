import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const timeSlots = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "16:00", "17:00", "18:00", "19:00", "20:00",
];

// Simulated data
const unavailableDays = [3, 7, 14, 21, 28];
const remainingReschedules = 2;

const Agendamento = () => {
  const [currentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { toast } = useToast();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isUnavailable = (day: number) => unavailableDays.includes(day) || day < today;

  const handleSchedule = () => {
    if (!selectedDay || !selectedTime) {
      toast({ title: "Selecione um dia e horário", variant: "destructive" });
      return;
    }

    const selectedDate = new Date(year, month, selectedDay);
    const [hours] = selectedTime.split(":").map(Number);
    selectedDate.setHours(hours, 0, 0, 0);

    const now = new Date();
    const diffHours = (selectedDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 2) {
      toast({
        title: "Horário indisponível",
        description: "Não é permitido agendamento com menos de 2h de antecedência.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Aula agendada!",
      description: `${selectedDay}/${month + 1} às ${selectedTime}`,
    });
    setSelectedDay(null);
    setSelectedTime(null);
  };

  return (
    <AppLayout title="Agendamento">
      <div className="animate-fade-in space-y-5">
        {/* Remaining reschedules */}
        <div className="glass-card flex items-center gap-3 p-3">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Remarcações disponíveis</p>
            <p className="font-heading text-lg font-bold text-primary">{remainingReschedules}</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="glass-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-sm font-bold">
              {months[month]} {year}
            </h2>
          </div>

          {/* Days of week header */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {daysOfWeek.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const unavailable = isUnavailable(day);
              const selected = selectedDay === day;
              return (
                <button
                  key={day}
                  disabled={unavailable}
                  onClick={() => {
                    setSelectedDay(day);
                    setSelectedTime(null);
                  }}
                  className={`relative flex h-9 items-center justify-center rounded-md text-xs font-medium transition-all
                    ${unavailable ? "text-muted-foreground/40 cursor-not-allowed" : "hover:bg-secondary"}
                    ${selected ? "gold-gradient text-primary-foreground font-bold" : ""}
                    ${day === today && !selected ? "border border-primary/50" : ""}
                  `}
                >
                  {day}
                  {unavailable && day >= today && (
                    <span className="absolute -bottom-0.5 text-[6px] text-destructive">Sem vaga</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        {selectedDay && (
          <div className="glass-card animate-slide-up p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="font-heading text-sm font-semibold">
                Horários — {selectedDay}/{month + 1}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all
                    ${selectedTime === time
                      ? "gold-gradient border-transparent text-primary-foreground"
                      : "border-border hover:border-primary/40 hover:bg-secondary/50"
                    }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-border"
            onClick={() => {
              setSelectedDay(null);
              setSelectedTime(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 gold-gradient text-primary-foreground font-heading font-semibold hover:opacity-90"
            onClick={handleSchedule}
          >
            Agendar
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Agendamento;
