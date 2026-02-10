import { User, Phone, Calendar, Mail } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const profileData = {
  nome: "João Silva",
  email: "joao@email.com",
  telefone: "(11) 99999-9999",
  nascimento: "15/03/1990",
  plano: "Trimestral",
  aulaSemana: "3x semana",
  vencimento: "10/03/2026",
};

const Perfil = () => {
  return (
    <AppLayout title="Meu Perfil">
      <div className="animate-fade-in space-y-5">
        {/* Avatar area */}
        <div className="flex flex-col items-center py-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full gold-gradient glow-gold">
            <span className="font-heading text-2xl font-bold text-primary-foreground">
              {profileData.nome.split(" ").map((n) => n[0]).join("")}
            </span>
          </div>
          <h2 className="mt-3 font-heading text-lg font-bold">{profileData.nome}</h2>
          <p className="text-xs text-muted-foreground">{profileData.email}</p>
        </div>

        {/* Info cards */}
        <div className="space-y-3">
          {[
            { icon: Mail, label: "E-mail", value: profileData.email },
            { icon: Phone, label: "Telefone", value: profileData.telefone },
            { icon: Calendar, label: "Nascimento", value: profileData.nascimento },
          ].map((item) => (
            <div key={item.label} className="glass-card flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Plan info */}
        <div className="glass-card glow-gold p-4">
          <h3 className="mb-3 font-heading text-sm font-bold gold-text">Meu Plano</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Plano</p>
              <p className="text-sm font-semibold">{profileData.plano}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Frequência</p>
              <p className="text-sm font-semibold">{profileData.aulaSemana}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-muted-foreground">Vencimento</p>
              <p className="text-sm font-semibold">{profileData.vencimento}</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Perfil;
