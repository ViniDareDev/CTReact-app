import { useState, useEffect } from "react";
import { DollarSign, Users, Clock, UserPlus, ChevronDown, ChevronUp, GraduationCap, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Lock, User, Mail, Phone, CalendarDays, Camera } from "lucide-react";

type Modalidade = "jiujitsu" | "hibrido" | "powerhitt" | "hibrido_hitt";
type TipoPlano = "mensal" | "trimestral" | "semestral";
type Frequencia = "2x" | "3x" | "4x";

interface PlanoOption { frequencia: Frequencia; valor: string; }

const planosConfig: Record<Modalidade, Partial<Record<TipoPlano, PlanoOption[]>>> = {
  jiujitsu: { mensal: [{ frequencia: "2x", valor: "R$200" }] },
  hibrido: {
    trimestral: [{ frequencia: "2x", valor: "3x de R$215" }, { frequencia: "3x", valor: "3x de R$250" }, { frequencia: "4x", valor: "3x de R$285" }],
    semestral: [{ frequencia: "2x", valor: "6x de R$199" }, { frequencia: "3x", valor: "6x de R$235" }, { frequencia: "4x", valor: "6x de R$269" }],
  },
  powerhitt: {
    trimestral: [{ frequencia: "2x", valor: "3x de R$145" }, { frequencia: "3x", valor: "3x de R$169" }],
    semestral: [{ frequencia: "2x", valor: "6x de R$109" }, { frequencia: "3x", valor: "6x de R$135" }],
  },
  hibrido_hitt: {
    trimestral: [{ frequencia: "2x", valor: "3x de R$260" }, { frequencia: "3x", valor: "3x de R$295" }, { frequencia: "4x", valor: "3x de R$330" }],
    semestral: [{ frequencia: "2x", valor: "6x de R$250" }, { frequencia: "3x", valor: "6x de R$285" }, { frequencia: "4x", valor: "6x de R$320" }],
  },
};

const modalidadeLabels: Record<Modalidade, string> = {
  jiujitsu: "JIU-JITSU", hibrido: "TREINO HÍBRIDO", powerhitt: "POWER HITT", hibrido_hitt: "HÍBRIDO + HITT",
};
const tipoPlanoLabels: Record<TipoPlano, string> = { mensal: "Mensal", trimestral: "Trimestral", semestral: "Semestral" };

const allTimeSlots = ["16:00", "17:00", "18:00", "19:00", "20:00"];
const dayLabels: Record<number, string> = { 1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta" };
const frequencyToCount: Record<string, number> = { "2x": 2, "3x": 3, "4x": 4 };

const AdminDashboard = () => {
  const today = new Date().toISOString().split("T")[0];
  const { toast } = useToast();
  const { session } = useAuth();

  // Payments state
  const [dataInicio, setDataInicio] = useState(today);
  const [dataFim, setDataFim] = useState(today);
  const [payments, setPayments] = useState<any[]>([]);

  // Classes state
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(new Date().getDay() || 1);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  // Teacher registration
  const [showProfessores, setShowProfessores] = useState(false);
  const [novoProf, setNovoProf] = useState("");
  const [profLoading, setProfLoading] = useState(false);

  // Cadastro state
  const [showCadastro, setShowCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [modalidade, setModalidade] = useState<Modalidade | "">("");
  const [tipoPlano, setTipoPlano] = useState<TipoPlano | "">("");
  const [frequencia, setFrequencia] = useState("");
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [cadastroLoading, setCadastroLoading] = useState(false);

  // Fetch payments (without join to profiles - use separate queries)
  useEffect(() => {
    const fetchPayments = async () => {
      const { data } = await supabase
        .from("payments")
        .select("*, profiles(name)")
        .gte("created_at", `${dataInicio}T00:00:00`)
        .lte("created_at", `${dataFim}T23:59:59`)
        .eq("status", "paid")
        .order("created_at", { ascending: false });
      setPayments(data || []);
    };
    fetchPayments();
  }, [dataInicio, dataFim]);

  // Fetch classes with bookings for selected day
  useEffect(() => {
    const fetchClasses = async () => {
      const todayStr = new Date().toISOString().split("T")[0];
      const { data: classes } = await supabase
        .from("classes")
        .select("id, time_slot, max_students, teacher_id")
        .eq("day_of_week", selectedDayOfWeek)
        .order("time_slot");

      if (!classes) return;

      const { data: bookings } = await supabase
        .from("bookings")
        .select("class_id, user_id, is_trial, trial_name, profiles(name)")
        .eq("booking_date", todayStr)
        .eq("status", "confirmed");

      const enriched = classes.map((c) => {
        const classBookings = bookings?.filter((b) => b.class_id === c.id) || [];
        return {
          ...c,
          bookings: classBookings.map((b) => ({
            name: b.is_trial ? `🆕 ${b.trial_name}` : (b as any).profiles?.name || "Aluno",
            isTrial: b.is_trial,
          })),
        };
      });

      setClassesData(enriched);
    };

    fetchClasses();

    const channel = supabase
      .channel("admin-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchClasses())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedDayOfWeek]);

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      const { data } = await supabase.from("teachers").select("*").order("name");
      setTeachers(data || []);
    };
    fetchTeachers();
  }, []);

  const totalRecebido = payments.reduce((acc, p) => acc + Number(p.amount), 0);

  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const availableTiposPlano = modalidade ? (Object.keys(planosConfig[modalidade as Modalidade] || {}) as TipoPlano[]) : [];
  const availableFrequencias = modalidade && tipoPlano ? planosConfig[modalidade as Modalidade]?.[tipoPlano as TipoPlano] || [] : [];

  const requiredDaysCount = frequencia ? frequencyToCount[frequencia] || 0 : 0;

  const toggleWeekday = (day: number) => {
    setSelectedWeekdays((prev) => {
      if (prev.includes(day)) return prev.filter((d) => d !== day);
      if (prev.length >= requiredDaysCount) return prev;
      return [...prev, day];
    });
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !senha || !modalidade || !tipoPlano || !frequencia) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (senha.length < 8) {
      toast({ title: "A senha deve ter no mínimo 8 caracteres", variant: "destructive" });
      return;
    }
    if (selectedWeekdays.length !== requiredDaysCount) {
      toast({ title: `Selecione exatamente ${requiredDaysCount} dias da semana`, variant: "destructive" });
      return;
    }

    setCadastroLoading(true);

    const { data, error } = await supabase.functions.invoke("create-student", {
      body: {
        email, password: senha, name: nome, phone: telefone,
        birth_date: dataNascimento || null,
        modality: modalidadeLabels[modalidade as Modalidade],
        plan_type: tipoPlanoLabels[tipoPlano as TipoPlano],
        frequency: frequencia,
        scheduled_days: selectedWeekdays,
      },
    });

    setCadastroLoading(false);

    if (error || data?.error) {
      toast({ title: "Erro ao cadastrar", description: data?.error || error?.message, variant: "destructive" });
      return;
    }

    toast({ title: "Aluno cadastrado com sucesso! ✅" });
    setShowCadastro(false);
    setNome(""); setEmail(""); setTelefone(""); setDataNascimento(""); setSenha("");
    setModalidade(""); setTipoPlano(""); setFrequencia(""); setSelectedWeekdays([]);
  };

  const handleAssignTeacher = async (classId: string, teacherId: string) => {
    await supabase.from("classes").update({ teacher_id: teacherId || null }).eq("id", classId);
    toast({ title: "Professor atualizado" });
  };

  const handleAddTeacher = async () => {
    if (!novoProf.trim()) return;
    setProfLoading(true);
    const { error } = await supabase.from("teachers").insert({ name: novoProf.trim() });
    setProfLoading(false);
    if (error) {
      toast({ title: "Erro ao cadastrar professor", variant: "destructive" });
      return;
    }
    toast({ title: "Professor cadastrado! ✅" });
    setNovoProf("");
    const { data } = await supabase.from("teachers").select("*").order("name");
    setTeachers(data || []);
  };

  const handleDeleteTeacher = async (id: string) => {
    await supabase.from("teachers").delete().eq("id", id);
    toast({ title: "Professor removido" });
    const { data } = await supabase.from("teachers").select("*").order("name");
    setTeachers(data || []);
  };

  return (
    <AppLayout title="Painel Admin" hideBottomNav>
      <div className="animate-fade-in space-y-5">

        {/* Cadastro de Aluno */}
        <div>
          <button onClick={() => setShowCadastro(!showCadastro)} className="flex w-full items-center justify-between glass-card p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-sm font-bold">Cadastrar Aluno</h2>
            </div>
            {showCadastro ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {showCadastro && (
            <form onSubmit={handleCadastro} className="glass-card mt-2 p-4 space-y-3 animate-fade-in">
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Telefone com DDD" value={telefone} onChange={(e) => setTelefone(formatTelefone(e.target.value))} className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary" />
                </div>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Senha (mín. 8 caracteres)"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="border-border/50 bg-secondary/50 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                  <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Modalidade */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Modalidade</Label>
                <RadioGroup value={modalidade} onValueChange={(v) => { setModalidade(v as Modalidade); setTipoPlano(""); setFrequencia(""); setSelectedWeekdays([]); }} className="grid grid-cols-2 gap-2">
                  {(Object.keys(modalidadeLabels) as Modalidade[]).map((key) => (
                    <label key={key} className={`flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition-all text-xs ${modalidade === key ? "border-primary bg-primary/10 text-foreground" : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"}`}>
                      <RadioGroupItem value={key} className="sr-only" />
                      <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center ${modalidade === key ? "border-primary" : "border-muted-foreground"}`}>
                        {modalidade === key && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                      <span className="font-medium leading-tight">{modalidadeLabels[key]}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {modalidade && availableTiposPlano.length > 0 && (
                <div className="space-y-2 animate-fade-in">
                  <Label className="text-xs font-semibold text-foreground">Tipo de Plano</Label>
                  <RadioGroup value={tipoPlano} onValueChange={(v) => { setTipoPlano(v as TipoPlano); setFrequencia(""); setSelectedWeekdays([]); }} className="flex gap-2">
                    {availableTiposPlano.map((tp) => (
                      <label key={tp} className={`flex-1 flex items-center justify-center rounded-lg border p-2.5 cursor-pointer transition-all text-xs ${tipoPlano === tp ? "border-primary bg-primary/10 text-foreground" : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"}`}>
                        <RadioGroupItem value={tp} className="sr-only" />
                        <span className="font-medium">{tipoPlanoLabels[tp]}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {tipoPlano && availableFrequencias.length > 0 && (
                <div className="space-y-2 animate-fade-in">
                  <Label className="text-xs font-semibold text-foreground">Frequência Semanal</Label>
                  <RadioGroup value={frequencia} onValueChange={(v) => { setFrequencia(v); setSelectedWeekdays([]); }} className="space-y-2">
                    {availableFrequencias.map((opt) => (
                      <label key={opt.frequencia} className={`flex items-center justify-between rounded-lg border p-2.5 cursor-pointer transition-all ${frequencia === opt.frequencia ? "border-primary bg-primary/10" : "border-border/50 bg-secondary/30 hover:border-border"}`}>
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

              {/* Weekday selection */}
              {frequencia && requiredDaysCount > 0 && (
                <div className="space-y-2 animate-fade-in">
                  <Label className="text-xs font-semibold text-foreground">
                    Dias da Semana ({selectedWeekdays.length}/{requiredDaysCount})
                  </Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((day) => {
                      const isSelected = selectedWeekdays.includes(day);
                      const isDisabled = !isSelected && selectedWeekdays.length >= requiredDaysCount;
                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => toggleWeekday(day)}
                          className={`rounded-lg border p-2 text-xs font-medium transition-all text-center ${
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground"
                              : isDisabled
                                ? "border-border/30 bg-secondary/10 text-muted-foreground/40 cursor-not-allowed"
                                : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"
                          }`}
                        >
                          {dayLabels[day]?.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={cadastroLoading} className="w-full gold-gradient font-heading font-semibold text-primary-foreground hover:opacity-90">
                {cadastroLoading ? "Cadastrando..." : "Confirmar Cadastro"}
              </Button>
            </form>
          )}
        </div>

        {/* Cadastro de Professores */}
        <div>
          <button onClick={() => setShowProfessores(!showProfessores)} className="flex w-full items-center justify-between glass-card p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-sm font-bold">Professores</h2>
            </div>
            {showProfessores ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {showProfessores && (
            <div className="glass-card mt-2 p-4 space-y-3 animate-fade-in">
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do professor"
                  value={novoProf}
                  onChange={(e) => setNovoProf(e.target.value)}
                  className="border-border/50 bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary flex-1"
                />
                <Button onClick={handleAddTeacher} disabled={profLoading} size="sm" className="gold-gradient text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {teachers.length > 0 ? (
                <div className="space-y-2">
                  {teachers.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                      <span className="text-xs font-medium">{t.name}</span>
                      <button onClick={() => handleDeleteTeacher(t.id)} className="text-destructive hover:text-destructive/80 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">Nenhum professor cadastrado.</p>
              )}
            </div>
          )}
        </div>

        {/* Controle de Pagamentos */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-sm font-bold">Controle de Pagamentos</h2>
          </div>
          <div className="glass-card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground">Data início</label>
                <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="border-border/50 bg-secondary/50 text-foreground text-xs focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Data fim</label>
                <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="border-border/50 bg-secondary/50 text-foreground text-xs focus:border-primary" />
              </div>
            </div>
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Total Recebido</p>
              <p className="font-heading text-xl font-bold gold-text">
                R$ {totalRecebido.toFixed(2).replace(".", ",")}
              </p>
            </div>
            {payments.length > 0 ? (
              <div className="space-y-2">
                {payments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                    <div>
                      <p className="text-xs font-medium">{(p as any).profiles?.name || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString("pt-BR")} • {p.method}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-success">R$ {Number(p.amount).toFixed(2).replace(".", ",")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">Nenhum pagamento no período.</p>
            )}
          </div>
        </div>

        {/* Turmas */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-sm font-bold">Turmas de Hoje</h2>
          </div>

          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDayOfWeek(d)}
                className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedDayOfWeek === d ? "gold-gradient border-transparent text-primary-foreground" : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/40"
                }`}
              >
                {dayLabels[d]}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {classesData.map((turma) => (
              <div key={turma.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-heading text-sm font-bold">{turma.time_slot}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    turma.bookings.length >= (turma.max_students || 6)
                      ? "bg-destructive/20 text-destructive"
                      : "bg-success/20 text-success"
                  }`}>
                    {turma.bookings.length}/{turma.max_students || 6} vagas
                  </span>
                </div>

                <div className="mb-2">
                  <Select
                    value={turma.teacher_id || "none"}
                    onValueChange={(val) => handleAssignTeacher(turma.id, val === "none" ? "" : val)}
                  >
                    <SelectTrigger className="h-7 text-[10px] bg-secondary/30 border-border/50">
                      <SelectValue placeholder="Selecionar professor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem professor</SelectItem>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-secondary mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${
                      turma.bookings.length >= (turma.max_students || 6) ? "bg-destructive" : "gold-gradient"
                    }`}
                    style={{ width: `${(turma.bookings.length / (turma.max_students || 6)) * 100}%` }}
                  />
                </div>

                {turma.bookings.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {turma.bookings.map((b: any, j: number) => (
                      <span
                        key={j}
                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                          b.isTrial ? "bg-primary/20 text-primary font-semibold" : "bg-secondary/50 text-foreground"
                        }`}
                      >
                        {b.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground">Nenhum aluno confirmado</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
