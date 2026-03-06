import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, User, Phone, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import loginBg from "@/assets/login-bg.jpeg";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const allTimeSlots = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "16:00", "17:00", "18:00", "19:00", "20:00",
];

const AulaExperimental = () => {
  const [currentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [spotsMap, setSpotsMap] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().getDate();
  const now = new Date();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isWeekend = (day: number) => {
    const date = new Date(year, month, day);
    const dow = date.getDay();
    return dow === 0 || dow === 6;
  };

  const isUnavailable = (day: number) => day < today || isWeekend(day);

  // Fetch bookings for selected day to show available spots
  useEffect(() => {
    if (!selectedDay) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    const selectedDate = new Date(year, month, selectedDay);
    const dayOfWeek = selectedDate.getDay(); // 0=Sun, 1=Mon...

    const fetchSpots = async () => {
      // Get classes for this day of week
      const { data: classes } = await supabase
        .from("classes")
        .select("id, time_slot, max_students")
        .eq("day_of_week", dayOfWeek);

      // Get bookings for this date
      const { data: bookings } = await supabase
        .from("bookings")
        .select("class_id")
        .eq("booking_date", dateStr)
        .eq("status", "confirmed");

      const map: Record<string, number> = {};
      if (classes) {
        classes.forEach((c) => {
          const booked = bookings?.filter((b) => b.class_id === c.id).length || 0;
          map[c.time_slot] = Math.max(0, (c.max_students || 6) - booked);
        });
      }
      setSpotsMap(map);
    };

    fetchSpots();

    // Real-time subscription
    const channel = supabase
      .channel(`bookings-trial-${dateStr}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        fetchSpots();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedDay, year, month]);

  const getAvailableTimeSlots = () => {
    if (!selectedDay) return [];
    const isToday = selectedDay === today;
    return allTimeSlots.filter((time) => {
      const [hours] = time.split(":").map(Number);
      if (isToday) {
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
        return hours * 60 >= currentTotalMinutes + 120;
      }
      return true;
    });
  };

  const availableTimeSlots = getAvailableTimeSlots();

  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleAgendar = async () => {
    if (!selectedDay || !selectedTime) {
      toast({ title: "Selecione um dia e horário", variant: "destructive" });
      return;
    }
    if (!nome.trim() || !telefone.trim()) {
      toast({ title: "Informe seu nome e telefone", variant: "destructive" });
      return;
    }

    const spots = spotsMap[selectedTime] ?? 0;
    if (spots <= 0) {
      toast({ title: "Turma lotada neste horário", variant: "destructive" });
      return;
    }

    setLoading(true);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    const selectedDate = new Date(year, month, selectedDay);
    const dayOfWeek = selectedDate.getDay();

    // Find the class
    const { data: classData } = await supabase
      .from("classes")
      .select("id")
      .eq("day_of_week", dayOfWeek)
      .eq("time_slot", selectedTime)
      .single();

    if (!classData) {
      setLoading(false);
      toast({ title: "Erro ao encontrar a turma", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("bookings").insert({
      class_id: classData.id,
      booking_date: dateStr,
      is_trial: true,
      trial_name: nome.trim(),
      trial_phone: telefone.trim(),
      status: "confirmed",
    });

    setLoading(false);

    if (error) {
      toast({ title: "Erro ao agendar", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: "Aula experimental agendada! 🎉",
      description: `${selectedDay}/${month + 1} às ${selectedTime}`,
    });

    setTimeout(() => navigate("/"), 2000);
  };

  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-y-auto">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${loginBg})` }} />
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

      <div className="relative z-10 mx-4 my-8 w-full max-w-md animate-fade-in">
        <div className="glass-card p-6">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-heading text-lg font-bold gold-text flex items-center gap-2">
                <Dumbbell className="h-5 w-5" /> Aula Experimental
              </h1>
              <p className="text-xs text-muted-foreground">Agende sua primeira aula gratuitamente</p>
            </div>
          </div>

          {/* Calendar */}
          <div className="glass-card p-4 mb-4">
            <h2 className="font-heading text-sm font-bold mb-3">
              {months[month]} {year}
            </h2>
            <div className="mb-2 grid grid-cols-7 gap-1">
              {daysOfWeek.map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {days.map((day) => {
                const unavailable = isUnavailable(day);
                const selected = selectedDay === day;
                return (
                  <button
                    key={day}
                    disabled={unavailable}
                    onClick={() => { setSelectedDay(day); setSelectedTime(null); }}
                    className={`flex h-9 items-center justify-center rounded-md text-xs font-medium transition-all
                      ${unavailable ? "text-muted-foreground/40 cursor-not-allowed" : "hover:bg-secondary"}
                      ${selected ? "gold-gradient text-primary-foreground font-bold" : ""}
                      ${day === today && !selected ? "border border-primary/50" : ""}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {selectedDay && (
            <div className="glass-card animate-slide-up p-4 mb-4">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="font-heading text-sm font-semibold">
                  Horários — {selectedDay}/{month + 1}
                </h3>
              </div>
              {availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableTimeSlots.map((time) => {
                    const spots = spotsMap[time] ?? 6;
                    const full = spots <= 0;
                    return (
                      <button
                        key={time}
                        disabled={full}
                        onClick={() => setSelectedTime(time)}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all
                          ${full ? "opacity-40 cursor-not-allowed border-border" :
                            selectedTime === time
                              ? "gold-gradient border-transparent text-primary-foreground"
                              : "border-border hover:border-primary/40 hover:bg-secondary/50"
                          }`}
                      >
                        {time}
                        <span className={`block text-[9px] mt-0.5 ${full ? "text-destructive" : "text-muted-foreground"}`}>
                          {full ? "Lotada" : `${spots} vaga${spots !== 1 ? "s" : ""}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3">
                  Nenhum horário disponível. Selecione outro dia.
                </p>
              )}
            </div>
          )}

          {/* Name & Phone */}
          {selectedTime && (
            <div className="glass-card animate-fade-in p-4 mb-4 space-y-3">
              <h3 className="font-heading text-sm font-semibold">Seus dados</h3>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Telefone com DDD"
                  value={telefone}
                  onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                  className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-border" onClick={() => navigate("/")}>
              Voltar
            </Button>
            <Button
              className="flex-1 gold-gradient text-primary-foreground font-heading font-semibold hover:opacity-90"
              onClick={handleAgendar}
              disabled={loading || !selectedDay || !selectedTime}
            >
              {loading ? "Agendando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AulaExperimental;
