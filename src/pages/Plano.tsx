import { CheckCircle2, Clock } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const planInfo = {
  tipo: "Trimestral",
  modalidade: "TREINO HÍBRIDO",
  aulaSemana: "3x semana",
  inicio: "10/12/2025",
  fim: "10/03/2026",
  diasRestantes: 28,
};

const allPlans = [
  { name: "Mensal", duration: "1 mês", highlight: false },
  { name: "Trimestral", duration: "3 meses", highlight: true },
  { name: "Semestral", duration: "6 meses", highlight: false },
  { name: "Anual", duration: "12 meses", highlight: false },
];

const Plano = () => {
  return (
    <AppLayout title="Meu Plano">
      <div className="animate-fade-in space-y-5">
        {/* Current plan */}
        <div className="glass-card glow-gold p-5">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <h2 className="font-heading text-sm font-bold">Plano Ativo</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Tipo</span>
              <span className="font-heading text-sm font-bold gold-text">{planInfo.tipo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Frequência</span>
              <span className="text-sm font-medium">{planInfo.aulaSemana}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Início</span>
              <span className="text-sm font-medium">{planInfo.inicio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Término</span>
              <span className="text-sm font-medium">{planInfo.fim}</span>
            </div>
            {/* Days remaining bar */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> Dias restantes
                </span>
                <span className="font-heading text-xs font-bold text-primary">
                  {planInfo.diasRestantes} dias
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full gold-gradient transition-all"
                  style={{ width: `${(planInfo.diasRestantes / 90) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plan options */}
        <div>
          <h3 className="mb-3 font-heading text-sm font-bold">Tipos de Plano</h3>
          <div className="grid grid-cols-2 gap-3">
            {allPlans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card p-4 text-center transition-all ${
                  plan.highlight ? "border-primary/50 glow-gold" : ""
                }`}
              >
                <p className={`font-heading text-sm font-bold ${plan.highlight ? "gold-text" : ""}`}>
                  {plan.name}
                </p>
                <p className="text-[10px] text-muted-foreground">{plan.duration}</p>
                {plan.highlight && (
                  <span className="mt-2 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Atual
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Business hours */}
        <div className="glass-card p-4">
          <h3 className="mb-3 font-heading text-sm font-bold">Horários de Funcionamento</h3>
          <p className="text-xs text-muted-foreground">Segunda à Sexta</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-xs">06:00 — 12:00</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground">12:00 — 16:00 (Fechado)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-xs">16:00 — 21:00</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Plano;
