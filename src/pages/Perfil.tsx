import { Phone, Calendar, Mail } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

const Perfil = () => {
  const { profile } = useAuth();

  const initials = profile?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("") || "?";

  return (
    <AppLayout title="Meu Perfil">
      <div className="animate-fade-in space-y-5">
        <div className="flex flex-col items-center py-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full gold-gradient glow-gold">
            <span className="font-heading text-2xl font-bold text-primary-foreground">{initials}</span>
          </div>
          <h2 className="mt-3 font-heading text-lg font-bold">{profile?.name || "—"}</h2>
        </div>

        <div className="space-y-3">
          {[
            { icon: Mail, label: "E-mail", value: profile?.email },
            { icon: Phone, label: "Telefone", value: profile?.phone },
            { icon: Calendar, label: "Nascimento", value: profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString("pt-BR") : "—" },
          ].map((item) => (
            <div key={item.label} className="glass-card flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium">{item.value || "—"}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card glow-gold p-4">
          <h3 className="mb-3 font-heading text-sm font-bold gold-text">Meu Plano</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Modalidade</p>
              <p className="text-sm font-semibold">{profile?.modality || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Plano</p>
              <p className="text-sm font-semibold">{profile?.plan_type || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Frequência</p>
              <p className="text-sm font-semibold">{profile?.frequency ? `${profile.frequency} semana` : "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Perfil;
