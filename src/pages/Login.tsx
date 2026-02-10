import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import loginBg from "@/assets/login-bg.jpeg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Simulated login - will be replaced with real auth
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      {/* Login card */}
      <div className="relative z-10 mx-4 w-full max-w-md animate-fade-in">
        <div className="glass-card p-8">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-2xl font-bold tracking-wide gold-text">
              REACT
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Centro de Treinamento e Reabilitação Funcional
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Usuário (e-mail)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-border/50 bg-secondary/50 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient font-heading font-semibold tracking-wide text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <button
              type="button"
              className="w-full text-center text-sm text-primary hover:text-gold-light transition-colors"
              onClick={() =>
                toast({ title: "Recuperação de senha", description: "Funcionalidade será habilitada em breve." })
              }
            >
              Esqueci minha senha
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
