import { useState } from "react";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AppLayout from "@/components/AppLayout";

type Modalidade = "jiujitsu" | "hibrido" | "powerhitt" | "hibrido_hitt";
type TipoPlano = "mensal" | "trimestral" | "semestral";

interface PlanoOption {
  frequencia: string;
  valor: string;
  rawValue: number;
}

const planosConfig: Record<Modalidade, Partial<Record<TipoPlano, PlanoOption[]>>> = {
  jiujitsu: {
    mensal: [{ frequencia: "2x", valor: "R$200/mês", rawValue: 200 }],
  },
  hibrido: {
    trimestral: [
      { frequencia: "2x", valor: "3x de R$215", rawValue: 215 },
      { frequencia: "3x", valor: "3x de R$250", rawValue: 250 },
      { frequencia: "4x", valor: "3x de R$285", rawValue: 285 },
    ],
    semestral: [
      { frequencia: "2x", valor: "6x de R$199", rawValue: 199 },
      { frequencia: "3x", valor: "6x de R$235", rawValue: 235 },
      { frequencia: "4x", valor: "6x de R$269", rawValue: 269 },
    ],
  },
  powerhitt: {
    trimestral: [
      { frequencia: "2x", valor: "3x de R$145", rawValue: 145 },
      { frequencia: "3x", valor: "3x de R$169", rawValue: 169 },
    ],
    semestral: [
      { frequencia: "2x", valor: "6x de R$109", rawValue: 109 },
      { frequencia: "3x", valor: "6x de R$135", rawValue: 135 },
    ],
  },
  hibrido_hitt: {
    trimestral: [
      { frequencia: "2x", valor: "3x de R$260", rawValue: 260 },
      { frequencia: "3x", valor: "3x de R$295", rawValue: 295 },
      { frequencia: "4x", valor: "3x de R$330", rawValue: 330 },
    ],
    semestral: [
      { frequencia: "2x", valor: "6x de R$250", rawValue: 250 },
      { frequencia: "3x", valor: "6x de R$285", rawValue: 285 },
      { frequencia: "4x", valor: "6x de R$320", rawValue: 320 },
    ],
  },
};

const modalidadeLabels: Record<Modalidade, string> = {
  jiujitsu: "JIU-JITSU",
  hibrido: "TREINO HÍBRIDO",
  powerhitt: "POWER HITT",
  hibrido_hitt: "HÍBRIDO + HITT",
};

const tipoPlanoLabels: Record<TipoPlano, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
};

const planInfo = {
  tipo: "Trimestral",
  modalidade: "TREINO HÍBRIDO",
  aulaSemana: "3x semana",
  inicio: "10/12/2025",
  fim: "10/03/2026",
  diasRestantes: 28,
};

const Plano = () => {
  const navigate = useNavigate();
  const [modalidade, setModalidade] = useState<Modalidade | "">("");
  const [tipoPlano, setTipoPlano] = useState<TipoPlano | "">("");
  const [frequencia, setFrequencia] = useState("");

  const availableTiposPlano = modalidade
    ? (Object.keys(planosConfig[modalidade as Modalidade] || {}) as TipoPlano[])
    : [];

  const availableFrequencias =
    modalidade && tipoPlano
      ? planosConfig[modalidade as Modalidade]?.[tipoPlano as TipoPlano] || []
      : [];

  const selectedOption = availableFrequencias.find((o) => o.frequencia === frequencia);

  const handleModalidadeChange = (val: string) => {
    setModalidade(val as Modalidade);
    setTipoPlano("");
    setFrequencia("");
  };

  const handleTipoPlanoChange = (val: string) => {
    setTipoPlano(val as TipoPlano);
    setFrequencia("");
  };

  const handleAlterarPlano = () => {
    if (!selectedOption) return;
    const desc = `${modalidadeLabels[modalidade as Modalidade]} — ${tipoPlanoLabels[tipoPlano as TipoPlano]} — ${frequencia} semana`;
    navigate("/pagamento", { state: { tipo: "Alteração de Plano", descricao: desc, valor: selectedOption.rawValue } });
  };

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
              <span className="text-xs text-muted-foreground">Plano</span>
              <span className="font-heading text-sm font-bold gold-text">{planInfo.tipo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Modalidade</span>
              <span className="text-sm font-medium">{planInfo.modalidade}</span>
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

        {/* Change plan area */}
        <div className="space-y-4">
          <h3 className="font-heading text-sm font-bold">Alterar Plano</h3>

          {/* Modalidade */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">Modalidade de Treino</Label>
            <RadioGroup value={modalidade} onValueChange={handleModalidadeChange} className="grid grid-cols-2 gap-2">
              {(Object.keys(modalidadeLabels) as Modalidade[]).map((key) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-all text-xs ${
                    modalidade === key
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"
                  }`}
                >
                  <RadioGroupItem value={key} className="sr-only" />
                  <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center ${modalidade === key ? "border-primary" : "border-muted-foreground"}`}>
                    {modalidade === key && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  <span className="font-medium leading-tight">{modalidadeLabels[key]}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Tipo de Plano */}
          {modalidade && availableTiposPlano.length > 0 && (
            <div className="space-y-2 animate-fade-in">
              <Label className="text-xs font-semibold text-foreground">Tipo de Plano</Label>
              <RadioGroup value={tipoPlano} onValueChange={handleTipoPlanoChange} className="flex gap-2">
                {availableTiposPlano.map((tp) => (
                  <label
                    key={tp}
                    className={`flex-1 flex items-center justify-center rounded-lg border p-3 cursor-pointer transition-all text-xs ${
                      tipoPlano === tp
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <RadioGroupItem value={tp} className="sr-only" />
                    <span className="font-medium">{tipoPlanoLabels[tp]}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Frequência */}
          {tipoPlano && availableFrequencias.length > 0 && (
            <div className="space-y-2 animate-fade-in">
              <Label className="text-xs font-semibold text-foreground">Frequência Semanal</Label>
              <RadioGroup value={frequencia} onValueChange={setFrequencia} className="space-y-2">
                {availableFrequencias.map((opt) => (
                  <label
                    key={opt.frequencia}
                    className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${
                      frequencia === opt.frequencia
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-secondary/30 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={opt.frequencia} className="sr-only" />
                      <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center ${frequencia === opt.frequencia ? "border-primary" : "border-muted-foreground"}`}>
                        {frequencia === opt.frequencia && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                      <span className="text-xs text-foreground font-medium">{opt.frequencia} na semana</span>
                    </div>
                    <span className="text-xs font-bold gold-text">{opt.valor}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Alterar button */}
          {selectedOption && (
            <Button
              className="w-full gold-gradient text-primary-foreground font-heading font-semibold hover:opacity-90 animate-fade-in"
              onClick={handleAlterarPlano}
            >
              Alterar Plano
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Plano;
