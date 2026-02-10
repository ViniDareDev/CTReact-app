import { useState } from "react";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";

const availableDays = [
  { day: 12, month: 2, weekday: "Qua" },
  { day: 14, month: 2, weekday: "Sex" },
  { day: 17, month: 2, weekday: "Seg" },
  { day: 19, month: 2, weekday: "Qua" },
  { day: 21, month: 2, weekday: "Sex" },
];

const timeSlots = ["07:00", "08:00", "09:00", "10:00", "16:00", "17:00", "18:00"];

const Avaliacao = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { toast } = useToast();

  // Simulated: last evaluation was 4 months ago => available
  const lastEvaluation = "10/10/2025";
  const isAvailable = true;

  const handleSchedule = () => {
    if (!selectedDay || !selectedTime) {
      toast({ title: "Selecione um dia e horário", variant: "destructive" });
      return;
    }
    toast({
      title: "Avaliação agendada!",
      description: "Você será direcionado para o pagamento.",
    });
  };

  if (!isAvailable) {
    return (
      <AppLayout title="Avaliação">
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="font-heading text-lg font-bold">Avaliação Indisponível</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            O agendamento de avaliação está disponível somente após 3 meses da última avaliação.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Última avaliação: <span className="text-primary font-semibold">{lastEvaluation}</span>
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Avaliação">
      <div className="animate-fade-in space-y-5">
        {/* Info */}
        <div className="glass-card flex items-center gap-3 p-3">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <div>
            <p className="text-xs text-muted-foreground">Última avaliação</p>
            <p className="font-heading text-sm font-semibold">{lastEvaluation}</p>
          </div>
        </div>

        {/* Day selection */}
        <div className="glass-card p-4">
          <h3 className="mb-3 font-heading text-sm font-bold">Dias Disponíveis</h3>
          <div className="grid grid-cols-3 gap-2">
            {availableDays.map((d) => (
              <button
                key={d.day}
                onClick={() => {
                  setSelectedDay(d.day);
                  setSelectedTime(null);
                }}
                className={`rounded-lg border p-3 text-center transition-all
                  ${selectedDay === d.day
                    ? "gold-gradient border-transparent text-primary-foreground"
                    : "border-border hover:border-primary/40"
                  }`}
              >
                <p className="text-[10px] text-inherit opacity-70">{d.weekday}</p>
                <p className="font-heading text-lg font-bold">{d.day}</p>
                <p className="text-[10px] text-inherit opacity-70">Fev</p>
              </button>
            ))}
          </div>
        </div>

        {/* Time slots */}
        {selectedDay && (
          <div className="glass-card animate-slide-up p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="font-heading text-sm font-semibold">Horários</h3>
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

        {/* Note about payment */}
        <div className="glass-card flex items-start gap-3 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-xs text-muted-foreground">
            A confirmação do agendamento é feita somente após a confirmação do pagamento da avaliação.
          </p>
        </div>

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

export default Avaliacao;
