import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const payments = [
  { month: "Fevereiro/2026", value: "R$ 250,00", status: "pendente", due: "10/02/2026" },
  { month: "Janeiro/2026", value: "R$ 250,00", status: "pago", due: "10/01/2026" },
  { month: "Dezembro/2025", value: "R$ 250,00", status: "pago", due: "10/12/2025" },
];

const Financeiro = () => {
  return (
    <AppLayout title="Financeiro">
      <div className="animate-fade-in space-y-5">
        {/* Summary card */}
        <div className="glass-card p-4">
          <h2 className="mb-3 font-heading text-sm font-bold">Resumo</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-success/10 p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Em dia</p>
              <p className="font-heading text-lg font-bold text-success">2</p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Pendentes</p>
              <p className="font-heading text-lg font-bold text-destructive">1</p>
            </div>
          </div>
        </div>

        {/* Payment list */}
        <div>
          <h3 className="mb-3 font-heading text-sm font-bold">Histórico de Pagamentos</h3>
          <div className="space-y-3">
            {payments.map((p, i) => (
              <div
                key={i}
                className={`glass-card flex items-center justify-between p-4 ${
                  p.status === "pendente" ? "border-destructive/30" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {p.status === "pago" ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{p.month}</p>
                    <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> Venc: {p.due}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading text-sm font-bold">{p.value}</p>
                  <p
                    className={`text-[10px] font-semibold ${
                      p.status === "pago" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {p.status === "pago" ? "Pago" : "Pendente"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Financeiro;
