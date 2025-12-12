import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClientAuth } from "@/hooks/useClientAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

type AuthMode = "login" | "signup" | "forgot" | "reset";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "Senha deve ter pelo menos 6 caracteres");

export default function ClientAuth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") as AuthMode || "login";
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signIn, user } = useClientAuth();

  // Check if coming from password reset link
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");
    
    if (accessToken && type === "recovery") {
      setMode("reset");
    }
  }, []);

  // Redirect if already logged in (except in reset mode)
  useEffect(() => {
    if (user && mode !== "reset") {
      navigate("/client/home");
    }
  }, [user, navigate, mode]);

  const validateForm = () => {
    try {
      if (mode === "forgot") {
        emailSchema.parse(email);
        return true;
      }
      
      if (mode === "reset") {
        passwordSchema.parse(newPassword);
        if (newPassword !== confirmPassword) {
          throw new Error("As senhas não coincidem");
        }
        return true;
      }
      
      emailSchema.parse(email);
      passwordSchema.parse(password);
      
      if (mode === "signup") {
        if (password !== confirmPassword) {
          throw new Error("As senhas não coincidem");
        }
        if (!name.trim()) {
          throw new Error("Nome é obrigatório");
        }
        if (!cpf.trim()) {
          throw new Error("CPF é obrigatório");
        }
      }
      return true;
    } catch (error: any) {
      toast({
        title: "Erro de validação",
        description: error.message || "Verifique os campos",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/client/auth?mode=reset`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      setMode("login");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });
      navigate("/client/home");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar a senha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (mode === "forgot") {
      return handleForgotPassword();
    }
    
    if (mode === "reset") {
      return handleResetPassword();
    }
    
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await signUp(email, password, {
          nome: name,
          cpf_cnpj: cpf,
          telefone: phone,
        });
        
        if (error) {
          if (error.message.includes("already registered")) {
            throw new Error("Este email já está cadastrado");
          }
          throw error;
        }
        
        toast({
          title: "Conta criada com sucesso!",
          description: "Você já está logado.",
        });
        navigate("/client/home");
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes("Invalid login")) {
            throw new Error("Email ou senha incorretos");
          }
          throw error;
        }
        
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta.",
        });
        navigate("/client/home");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "forgot": return "Recuperar Senha";
      case "reset": return "Nova Senha";
      case "signup": return "Cadastrar";
      default: return "Fazer Login";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "forgot": return "Digite seu email para recuperar";
      case "reset": return "Digite sua nova senha";
      case "signup": return "Crie sua conta";
      default: return "Bem-vindo(a) de Volta!";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="pt-6 pb-4 px-4 flex items-center">
        <button
          onClick={() => mode === "forgot" || mode === "reset" ? setMode("login") : navigate("/client")}
          className="p-2 -ml-2 text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-xl font-bold text-foreground tracking-tight text-center pr-8">
          Falls-to-Car
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4">
        {/* Welcome Text */}
        <div className="mb-8">
          <p className="text-muted-foreground text-sm">{getSubtitle()}</p>
          <h2 className="text-2xl font-bold text-foreground">{getTitle()}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Forgot Password Form */}
          {mode === "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Insira seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-border bg-background"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Enviaremos um link para você redefinir sua senha.
              </p>
            </div>
          )}

          {/* Reset Password Form */}
          {mode === "reset" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground font-medium">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl border-border bg-background pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-border bg-background"
                />
              </div>
            </>
          )}

          {/* Signup Fields */}
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 rounded-xl border-border bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-foreground font-medium">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                  className="h-12 rounded-xl border-border bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground font-medium">
                  Telefone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="h-12 rounded-xl border-border bg-background"
                />
              </div>
            </>
          )}

          {/* Login & Signup Email/Password */}
          {(mode === "login" || mode === "signup") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Insira seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-border bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl border-border bg-background pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                Confirmar Senha
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-border bg-background"
              />
            </div>
          )}

          {mode === "login" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-foreground cursor-pointer">
                  Lembrar Login
                </Label>
              </div>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-sm text-primary hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-medium mt-6"
            disabled={loading}
          >
            {loading
              ? "Carregando..."
              : mode === "forgot"
              ? "Enviar Email"
              : mode === "reset"
              ? "Atualizar Senha"
              : mode === "login"
              ? "Login"
              : "Criar Conta"}
          </Button>

          {(mode === "login" || mode === "signup") && (
            <div className="text-center pt-4">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
              >
                {mode === "login" ? (
                  <>
                    Não tem conta?{" "}
                    <span className="text-primary hover:underline">Criar conta</span>
                  </>
                ) : (
                  <>
                    Já tem conta?{" "}
                    <span className="text-primary hover:underline">Fazer login</span>
                  </>
                )}
              </button>
            </div>
          )}

          {mode === "forgot" && (
            <div className="text-center pt-4">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMode("login")}
              >
                Voltar para o{" "}
                <span className="text-primary hover:underline">Login</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
