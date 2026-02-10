import { useNavigate } from "react-router-dom";
import { CalendarDays, ClipboardCheck, CreditCard, FileText, User } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const menuItems = [
  {
    icon: User,
    label: "Meu Perfil",
    description: "Dados pessoais e configurações",
    path: "/perfil",
  },
  {
    icon: CalendarDays,
    label: "Agendamento / Remarcação",
    description: "Agende ou remarque suas aulas",
    path: "/agendamento",
  },
  {
    icon: ClipboardCheck,
    label: "Avaliação",
    description: "Agende sua avaliação física",
    path: "/avaliacao",
  },
  {
    icon: FileText,
    label: "Meu Plano",
    description: "Detalhes do seu plano atual",
    path: "/plano",
  },
  {
    icon: CreditCard,
    label: "Financeiro",
    description: "Pagamentos e faturas",
    path: "/financeiro",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <AppLayout title="Início">
      <div className="animate-fade-in space-y-4">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="font-heading text-xl font-bold">
            Olá, <span className="gold-text">Aluno</span> 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Bem-vindo ao REACT Centro de Treinamento
          </p>
        </div>

        {/* Quick info card */}
        <div className="glass-card glow-gold p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Próxima aula</p>
              <p className="font-heading text-sm font-semibold">Seg, 10 Fev — 07:00</p>
            </div>
            <div className="gold-gradient rounded-lg px-3 py-1.5">
              <span className="font-heading text-xs font-bold text-primary-foreground">3x Semana</span>
            </div>
          </div>
        </div>

        {/* Menu grid */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="glass-card flex w-full items-center gap-4 p-4 text-left transition-all hover:border-primary/30 hover:bg-secondary/50 active:scale-[0.98]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-heading text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
