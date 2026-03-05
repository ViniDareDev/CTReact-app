import { useState } from "react";
import { DollarSign, Users, CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";

// Simulated payment data
const paymentsByDate: Record<string, { aluno: string; valor: string; metodo: string; hora: string }[]> = {
  "2026-03-05": [
    { aluno: "João Silva", valor: "R$ 250,00", metodo: "Cartão", hora: "08:32" },
    { aluno: "Maria Oliveira", valor: "R$ 215,00", metodo: "PIX", hora: "10:15" },
    { aluno: "Carlos Santos", valor: "R$ 169,00", metodo: "Cartão", hora: "14:40" },
  ],
  "2026-03-04": [
    { aluno: "Ana Costa", valor: "R$ 250,00", metodo: "PIX", hora: "09:00" },
    { aluno: "Pedro Lima", valor: "R$ 285,00", metodo: "Cartão", hora: "11:22" },
  ],
};

// Simulated classes/turmas
const turmas = [
  {
    horario: "06:00",
    modalidade: "TREINO HÍBRIDO",
    vagas: 12,
    alunos: ["João Silva", "Maria Oliveira", "Carlos Santos", "Ana Costa", "Pedro Lima", "Lucas Mendes", "Fernanda Dias", "Roberto Alves"],
  },
  {
    horario: "07:00",
    modalidade: "POWER HITT",
    vagas: 10,
    alunos: ["Juliana Rocha", "Marcos Ferreira", "Tatiana Borges", "Diego Nunes", "Camila Souza"],
  },
  {
    horario: "08:00",
    modalidade: "JIU-JITSU",
    vagas: 15,
    alunos: ["Ricardo Gomes", "Patrícia Lopes", "Eduardo Martins"],
  },
  {
    horario: "16:00",
    modalidade: "HÍBRIDO + HITT",
    vagas: 12,
    alunos: ["Beatriz Cardoso", "Felipe Ribeiro", "Gabriela Torres", "Hugo Barros", "Larissa Azevedo", "Thiago Pereira", "Vanessa Cruz", "André Moreira", "Daniela Freitas", "Gustavo Pinto"],
  },
  {
    horario: "17:00",
    modalidade: "TREINO HÍBRIDO",
    vagas: 12,
    alunos: ["Isabela Ramos", "Leonardo Castro", "Mariana Vieira", "Otávio Duarte"],
  },
  {
    horario: "18:00",
    modalidade: "POWER HITT",
    vagas: 10,
    alunos: ["Sofia Correia", "Vinícius Sousa", "Amanda Teixeira", "Bruno Farias", "Clara Nogueira", "Danilo Machado", "Elisa Cunha"],
  },
];

const AdminDashboard = () => {
  const today = new Date().toISOString().split("T")[0];
  const [dataInicio, setDataInicio] = useState(today);
  const [dataFim, setDataFim] = useState(today);

  // Get payments for date range
  const getPaymentsInRange = () => {
    const result: { data: string; aluno: string; valor: string; metodo: string; hora: string }[] = [];
    Object.entries(paymentsByDate).forEach(([date, payments]) => {
      if (date >= dataInicio && date <= dataFim) {
        payments.forEach((p) => result.push({ data: date, ...p }));
      }
    });
    return result.sort((a, b) => b.data.localeCompare(a.data) || b.hora.localeCompare(a.hora));
  };

  const paymentsInRange = getPaymentsInRange();
  const totalRecebido = paymentsInRange.reduce((acc, p) => {
    const val = parseFloat(p.valor.replace(/[^\d,]/g, "").replace(",", "."));
    return acc + val;
  }, 0);

  return (
    <AppLayout title="Painel Admin">
      <div className="animate-fade-in space-y-5">
        {/* Section: Controle de Pagamentos */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-sm font-bold">Controle de Pagamentos</h2>
          </div>

          {/* Date filters */}
          <div className="glass-card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground">Data início</label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="border-border/50 bg-secondary/50 text-foreground text-xs focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Data fim</label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="border-border/50 bg-secondary/50 text-foreground text-xs focus:border-primary"
                />
              </div>
            </div>

            {/* Total */}
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Total Recebido</p>
              <p className="font-heading text-xl font-bold gold-text">
                R$ {totalRecebido.toFixed(2).replace(".", ",")}
              </p>
            </div>

            {/* Payments list */}
            {paymentsInRange.length > 0 ? (
              <div className="space-y-2">
                {paymentsInRange.map((p, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                    <div>
                      <p className="text-xs font-medium">{p.aluno}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.data.split("-").reverse().join("/")} às {p.hora} • {p.metodo}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-success">{p.valor}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">
                Nenhum pagamento encontrado no período selecionado.
              </p>
            )}
          </div>
        </div>

        {/* Section: Gerenciar Horários e Turmas */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-sm font-bold">Turmas de Hoje</h2>
          </div>

          <div className="space-y-3">
            {turmas.map((turma, i) => (
              <div key={i} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-heading text-sm font-bold">{turma.horario}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    turma.alunos.length >= turma.vagas
                      ? "bg-destructive/20 text-destructive"
                      : "bg-success/20 text-success"
                  }`}>
                    {turma.alunos.length}/{turma.vagas} vagas
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">{turma.modalidade}</p>

                {/* Progress bar */}
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${
                      turma.alunos.length >= turma.vagas ? "bg-destructive" : "gold-gradient"
                    }`}
                    style={{ width: `${(turma.alunos.length / turma.vagas) * 100}%` }}
                  />
                </div>

                {/* Students */}
                <div className="flex flex-wrap gap-1">
                  {turma.alunos.map((aluno, j) => (
                    <span
                      key={j}
                      className="rounded-full bg-secondary/50 px-2 py-0.5 text-[10px] text-foreground"
                    >
                      {aluno}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
