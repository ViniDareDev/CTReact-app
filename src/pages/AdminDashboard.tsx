import { useState, useEffect } from "react";
import { DollarSign, Users, UserPlus, GraduationCap, CalendarDays, Home, Search, Pencil, Trash2, Plus, Clock, ChevronDown, ChevronUp, Eye, EyeOff, Lock, User, Mail, Phone, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import logoTransparent from "@/assets/logo-transparent.png";
import { LogOut } from "lucide-react";

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

const allTimeSlots = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"];
const dayLabels: Record<number, string> = { 1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta" };
const frequencyToCount: Record<string, number> = { "2x": 2, "3x": 3, "4x": 4 };

type AdminTab = "home" | "alunos" | "professores" | "turmas" | "pagamentos";

const AdminDashboard = () => {
  const today = new Date().toISOString().split("T")[0];
  const { toast } = useToast();
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<AdminTab>("home");

  // ── Home: Today's payments ──
  const [todayPayments, setTodayPayments] = useState<any[]>([]);

  // ── Home: Today's classes ──
  const [todayClasses, setTodayClasses] = useState<any[]>([]);

  // ── Payments tab ──
  const [dataInicio, setDataInicio] = useState(today);
  const [dataFim, setDataFim] = useState(today);
  const [payments, setPayments] = useState<any[]>([]);

  // ── Classes/Turmas tab ──
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(new Date().getDay() || 1);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  // ── Teacher tab ──
  const [novoProf, setNovoProf] = useState("");
  const [profLoading, setProfLoading] = useState(false);
  const [profSearch, setProfSearch] = useState("");
  const [editingTeacher, setEditingTeacher] = useState<string | null>(null);
  const [editTeacherName, setEditTeacherName] = useState("");

  // ── Student tab ──
  const [showCadastroForm, setShowCadastroForm] = useState(false);
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
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<Record<number, string>>({});
  const [cadastroLoading, setCadastroLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  const nomeGestor = profile?.name?.split(" ")[0] || "Gestor";

  // ── Fetch today's payments for Home ──
  useEffect(() => {
    const fetchTodayPayments = async () => {
      const { data } = await supabase
        .from("payments")
        .select("*, profiles(name)")
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)
        .eq("status", "paid")
        .order("created_at", { ascending: false });
      setTodayPayments(data || []);
    };
    fetchTodayPayments();

    const channel = supabase
      .channel("admin-today-payments")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => fetchTodayPayments())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [today]);

  // ── Fetch today's classes for Home ──
  useEffect(() => {
    const fetchTodayClasses = async () => {
      const now = new Date();
      const currentDow = now.getDay();
      if (currentDow === 0 || currentDow === 6) {
        setTodayClasses([]);
        return;
      }

      const todayStr = now.toISOString().split("T")[0];
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const { data: classes } = await supabase
        .from("classes")
        .select("id, time_slot, max_students, teacher_id")
        .eq("day_of_week", currentDow)
        .order("time_slot");

      if (!classes) return;

      const { data: bookings } = await supabase
        .from("bookings")
        .select("class_id, user_id, is_trial, trial_name, profiles(name)")
        .eq("booking_date", todayStr)
        .eq("status", "confirmed");

      // Filter: only show classes currently in progress (started but not ended)
      const filtered = classes.filter((c) => {
        const [h] = c.time_slot.split(":").map(Number);
        const classEndMinutes = (h + 1) * 60;
        const nowMinutes = currentHour * 60 + currentMinute;
        return nowMinutes < classEndMinutes && nowMinutes >= h * 60;
      });

      // If no class is currently in progress, show next upcoming classes
      let displayClasses = filtered;
      if (filtered.length === 0) {
        displayClasses = classes.filter((c) => {
          const [h] = c.time_slot.split(":").map(Number);
          return h * 60 > currentHour * 60 + currentMinute;
        }).slice(0, 3);
      }

      // If still empty (all classes done), show all today's classes
      if (displayClasses.length === 0) {
        displayClasses = classes;
      }

      const enriched = displayClasses.map((c) => {
        const classBookings = bookings?.filter((b) => b.class_id === c.id) || [];
        return {
          ...c,
          bookings: classBookings.map((b) => ({
            name: b.is_trial ? `${b.trial_name} (Experimental)` : (b as any).profiles?.name || "Aluno",
            isTrial: b.is_trial,
          })),
        };
      });

      setTodayClasses(enriched);
    };

    fetchTodayClasses();
    const interval = setInterval(fetchTodayClasses, 60000); // refresh every minute

    const channel = supabase
      .channel("admin-today-classes")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchTodayClasses())
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Fetch payments for Payments tab ──
  useEffect(() => {
    if (activeTab !== "pagamentos") return;
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
  }, [dataInicio, dataFim, activeTab]);

  // ── Fetch classes for Turmas tab ──
  useEffect(() => {
    if (activeTab !== "turmas") return;
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
            name: b.is_trial ? `${b.trial_name} (Experimental)` : (b as any).profiles?.name || "Aluno",
            isTrial: b.is_trial,
          })),
        };
      });

      setClassesData(enriched);
    };

    fetchClasses();

    const channel = supabase
      .channel("admin-bookings-turmas")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchClasses())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedDayOfWeek, activeTab]);

  // ── Fetch teachers ──
  useEffect(() => {
    const fetchTeachers = async () => {
      const { data } = await supabase.from("teachers").select("*").order("name");
      setTeachers(data || []);
    };
    fetchTeachers();
  }, []);

  // ── Fetch students ──
  useEffect(() => {
    if (activeTab !== "alunos") return;
    const fetchStudents = async () => {
      const { data } = await supabase.from("profiles").select("*").order("name");
      setStudents(data || []);
    };
    fetchStudents();
  }, [activeTab]);

  // ── Helpers ──
  const totalTodayReceived = todayPayments.reduce((acc, p) => acc + Number(p.amount), 0);
  const todayByMethod = todayPayments.reduce((acc: Record<string, number>, p) => {
    const m = p.method === "cartao" ? "Cartão de Crédito" : "PIX";
    acc[m] = (acc[m] || 0) + Number(p.amount);
    return acc;
  }, {});
  const todayByType = todayPayments.reduce((acc: Record<string, number>, p) => {
    const desc = p.description || "Outros";
    let category = "Outros";
    if (desc.toLowerCase().includes("experimental")) category = "Aula Experimental";
    else if (desc.toLowerCase().includes("alteração") || desc.toLowerCase().includes("plano")) category = "Alteração de Plano";
    else if (desc.toLowerCase().includes("avaliação")) category = "Avaliação";
    else category = "Pagamento do Plano";
    acc[category] = (acc[category] || 0) + Number(p.amount);
    return acc;
  }, {});

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
      if (prev.includes(day)) {
        const newDays = prev.filter((d) => d !== day);
        const newSlots = { ...selectedTimeSlots };
        delete newSlots[day];
        setSelectedTimeSlots(newSlots);
        return newDays;
      }
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
    // Check all days have time slots
    for (const day of selectedWeekdays) {
      if (!selectedTimeSlots[day]) {
        toast({ title: `Selecione o horário para ${dayLabels[day]}`, variant: "destructive" });
        return;
      }
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
        scheduled_time_slots: selectedTimeSlots,
      },
    });

    setCadastroLoading(false);

    if (error || data?.error) {
      toast({ title: "Erro ao cadastrar", description: data?.error || error?.message, variant: "destructive" });
      return;
    }

    toast({ title: "Aluno cadastrado com sucesso! ✅" });
    setShowCadastroForm(false);
    setNome(""); setEmail(""); setTelefone(""); setDataNascimento(""); setSenha("");
    setModalidade(""); setTipoPlano(""); setFrequencia(""); setSelectedWeekdays([]); setSelectedTimeSlots({});
    // Refresh students
    const { data: studs } = await supabase.from("profiles").select("*").order("name");
    setStudents(studs || []);
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

  const handleEditTeacher = async (id: string) => {
    if (!editTeacherName.trim()) return;
    await supabase.from("teachers").update({ name: editTeacherName.trim() }).eq("id", id);
    toast({ title: "Professor atualizado" });
    setEditingTeacher(null);
    const { data } = await supabase.from("teachers").select("*").order("name");
    setTeachers(data || []);
  };

  const handleDeleteStudent = async (id: string) => {
    // Delete via edge function or admin - for now just remove profile
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir aluno", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Aluno removido" });
    const { data } = await supabase.from("profiles").select("*").order("name");
    setStudents(data || []);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const filteredTeachers = teachers.filter((t) => t.name.toLowerCase().includes(profSearch.toLowerCase()));
  const filteredStudents = students.filter((s) => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase()));

  const navItems = [
    { key: "home" as AdminTab, icon: Home, label: "Início" },
    { key: "alunos" as AdminTab, icon: UserPlus, label: "Alunos" },
    { key: "professores" as AdminTab, icon: GraduationCap, label: "Professores" },
    { key: "turmas" as AdminTab, icon: CalendarDays, label: "Turmas" },
    { key: "pagamentos" as AdminTab, icon: DollarSign, label: "Pagamentos" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logoTransparent} alt="REACT" className="h-8 w-8 object-contain" />
            <span className="font-heading text-sm font-bold gold-text">Painel Admin</span>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-24 pt-4">
        <div className="animate-fade-in space-y-5">

          {/* ═══════════════ HOME TAB ═══════════════ */}
          {activeTab === "home" && (
            <>
              {/* Welcome */}
              <div className="mb-4">
                <h1 className="font-heading text-xl font-bold">
                  Olá, <span className="gold-text">{nomeGestor}</span> 👋
                </h1>
                <p className="text-sm text-muted-foreground">Bem-vindo ao painel administrativo do CT React.</p>
              </div>

              {/* Recebimentos de Hoje */}
              <div className="glass-card glow-gold p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h2 className="font-heading text-sm font-bold">Recebimentos de Hoje</h2>
                </div>
                <div className="rounded-lg bg-primary/10 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Total Recebido</p>
                  <p className="font-heading text-xl font-bold gold-text">
                    R$ {totalTodayReceived.toFixed(2).replace(".", ",")}
                  </p>
                </div>
                {/* By method */}
                {Object.keys(todayByMethod).length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(todayByMethod).map(([method, val]) => (
                      <div key={method} className="rounded-lg bg-secondary/30 p-2 text-center">
                        <p className="text-[9px] text-muted-foreground">{method}</p>
                        <p className="text-xs font-bold text-foreground">R$ {(val as number).toFixed(2).replace(".", ",")}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* By type */}
                {Object.keys(todayByType).length > 0 && (
                  <div className="space-y-1">
                    {Object.entries(todayByType).map(([type, val]) => (
                      <div key={type} className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-1.5">
                        <span className="text-[10px] text-muted-foreground">{type}</span>
                        <span className="text-[10px] font-bold text-foreground">R$ {val.toFixed(2).replace(".", ",")}</span>
                      </div>
                    ))}
                  </div>
                )}
                {todayPayments.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">Nenhum recebimento hoje.</p>
                )}
              </div>

              {/* Turmas de Hoje */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="font-heading text-sm font-bold">Turmas de Hoje</h2>
                </div>
                {todayClasses.length > 0 ? (
                  todayClasses.map((turma) => (
                    <div key={turma.id} className="glass-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-heading text-sm font-bold">{turma.time_slot}</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          turma.bookings.length >= (turma.max_students || 6) ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"
                        }`}>
                          {turma.bookings.length}/{turma.max_students || 6} vagas
                        </span>
                      </div>
                      {turma.bookings.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {turma.bookings.map((b: any, j: number) => (
                            <span key={j} className={`rounded-full px-2 py-0.5 text-[10px] ${
                              b.isTrial ? "bg-primary/20 text-primary font-semibold" : "bg-secondary/50 text-foreground"
                            }`}>
                              {b.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">Nenhum aluno confirmado</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center glass-card p-4">Nenhuma turma em andamento.</p>
                )}
              </div>

              {/* Quick navigation */}
              <div className="space-y-3">
                {[
                  { tab: "alunos" as AdminTab, icon: UserPlus, label: "Cadastro de Aluno", desc: "Cadastrar, pesquisar e gerenciar alunos" },
                  { tab: "professores" as AdminTab, icon: GraduationCap, label: "Cadastro de Professor", desc: "Cadastrar e gerenciar professores" },
                  { tab: "turmas" as AdminTab, icon: CalendarDays, label: "Gerenciamento de Turmas", desc: "Visualizar turmas e atribuir professores" },
                ].map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className="glass-card flex w-full items-center gap-4 p-4 text-left transition-all hover:border-primary/30 hover:bg-secondary/50 active:scale-[0.98]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-heading text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ═══════════════ ALUNOS TAB ═══════════════ */}
          {activeTab === "alunos" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold">Alunos</h2>
                <Button size="sm" onClick={() => setShowCadastroForm(!showCadastroForm)} className="gold-gradient text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4 mr-1" /> Cadastrar
                </Button>
              </div>

              {showCadastroForm && (
                <form onSubmit={handleCadastro} className="glass-card p-4 space-y-3 animate-fade-in">
                  <h3 className="font-heading text-sm font-bold">Novo Aluno</h3>
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
                    <RadioGroup value={modalidade} onValueChange={(v) => { setModalidade(v as Modalidade); setTipoPlano(""); setFrequencia(""); setSelectedWeekdays([]); setSelectedTimeSlots({}); }} className="grid grid-cols-2 gap-2">
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
                      <RadioGroup value={tipoPlano} onValueChange={(v) => { setTipoPlano(v as TipoPlano); setFrequencia(""); setSelectedWeekdays([]); setSelectedTimeSlots({}); }} className="flex gap-2">
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
                      <RadioGroup value={frequencia} onValueChange={(v) => { setFrequencia(v); setSelectedWeekdays([]); setSelectedTimeSlots({}); }} className="space-y-2">
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

                  {/* Weekday + Time slot selection */}
                  {frequencia && requiredDaysCount > 0 && (
                    <div className="space-y-2 animate-fade-in">
                      <Label className="text-xs font-semibold text-foreground">
                        Dias e Horários ({selectedWeekdays.length}/{requiredDaysCount})
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
                                isSelected ? "border-primary bg-primary/10 text-foreground"
                                  : isDisabled ? "border-border/30 bg-secondary/10 text-muted-foreground/40 cursor-not-allowed"
                                  : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"
                              }`}
                            >
                              {dayLabels[day]?.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                      {/* Time slot for each selected day */}
                      {selectedWeekdays.sort().map((day) => (
                        <div key={day} className="flex items-center gap-2 animate-fade-in">
                          <span className="text-xs font-medium text-foreground w-16">{dayLabels[day]?.slice(0, 3)}:</span>
                          <Select value={selectedTimeSlots[day] || ""} onValueChange={(v) => setSelectedTimeSlots((prev) => ({ ...prev, [day]: v }))}>
                            <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/50 flex-1">
                              <SelectValue placeholder="Horário" />
                            </SelectTrigger>
                            <SelectContent>
                              {allTimeSlots.map((ts) => (
                                <SelectItem key={ts} value={ts}>{ts}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button type="submit" disabled={cadastroLoading} className="w-full gold-gradient font-heading font-semibold text-primary-foreground hover:opacity-90">
                    {cadastroLoading ? "Cadastrando..." : "Confirmar Cadastro"}
                  </Button>
                </form>
              )}

              {/* Search & list */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar aluno..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary" />
              </div>

              <div className="space-y-2">
                {filteredStudents.map((s) => (
                  <div key={s.id} className="glass-card p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.email}</p>
                      <p className="text-[10px] text-muted-foreground">{s.modality || "—"} • {s.frequency || "—"}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleDeleteStudent(s.id)} className="text-destructive hover:text-destructive/80 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredStudents.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhum aluno encontrado.</p>
                )}
              </div>
            </>
          )}

          {/* ═══════════════ PROFESSORES TAB ═══════════════ */}
          {activeTab === "professores" && (
            <>
              <h2 className="font-heading text-lg font-bold">Professores</h2>

              <div className="glass-card p-4 space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="Nome do professor" value={novoProf} onChange={(e) => setNovoProf(e.target.value)} className="border-border/50 bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary flex-1" />
                  <Button onClick={handleAddTeacher} disabled={profLoading} size="sm" className="gold-gradient text-primary-foreground hover:opacity-90">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar professor..." value={profSearch} onChange={(e) => setProfSearch(e.target.value)} className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary" />
              </div>

              <div className="space-y-2">
                {filteredTeachers.map((t) => (
                  <div key={t.id} className="glass-card p-3 flex items-center justify-between">
                    {editingTeacher === t.id ? (
                      <div className="flex gap-2 flex-1">
                        <Input value={editTeacherName} onChange={(e) => setEditTeacherName(e.target.value)} className="border-border/50 bg-secondary/50 text-foreground text-xs flex-1" />
                        <Button size="sm" onClick={() => handleEditTeacher(t.id)} className="gold-gradient text-primary-foreground text-xs">Salvar</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingTeacher(null)}>✕</Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-medium">{t.name}</span>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingTeacher(t.id); setEditTeacherName(t.name); }} className="text-primary hover:text-primary/80 p-1">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteTeacher(t.id)} className="text-destructive hover:text-destructive/80 p-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {filteredTeachers.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhum professor encontrado.</p>
                )}
              </div>
            </>
          )}

          {/* ═══════════════ TURMAS TAB ═══════════════ */}
          {activeTab === "turmas" && (
            <>
              <h2 className="font-heading text-lg font-bold">Gerenciamento de Turmas</h2>

              <div className="flex gap-2 overflow-x-auto pb-1">
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
                        turma.bookings.length >= (turma.max_students || 6) ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"
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
                        className={`h-full rounded-full transition-all ${turma.bookings.length >= (turma.max_students || 6) ? "bg-destructive" : "gold-gradient"}`}
                        style={{ width: `${(turma.bookings.length / (turma.max_students || 6)) * 100}%` }}
                      />
                    </div>

                    {turma.bookings.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {turma.bookings.map((b: any, j: number) => (
                          <span key={j} className={`rounded-full px-2 py-0.5 text-[10px] ${b.isTrial ? "bg-primary/20 text-primary font-semibold" : "bg-secondary/50 text-foreground"}`}>
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
            </>
          )}

          {/* ═══════════════ PAGAMENTOS TAB ═══════════════ */}
          {activeTab === "pagamentos" && (
            <>
              <h2 className="font-heading text-lg font-bold">Controle de Pagamentos</h2>

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
                            {new Date(p.created_at).toLocaleDateString("pt-BR")} • {p.method === "cartao" ? "Cartão" : "PIX"}
                          </p>
                          {p.description && <p className="text-[9px] text-muted-foreground">{p.description}</p>}
                        </div>
                        <p className="text-xs font-bold text-success">R$ {Number(p.amount).toFixed(2).replace(".", ",")}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-3">Nenhum pagamento no período.</p>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-bottom">
        <div className="mx-auto flex max-w-md items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "drop-shadow-[0_0_6px_hsl(var(--gold)/0.5)]" : ""}`} />
                <span className="text-[10px] font-medium font-heading">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AdminDashboard;
