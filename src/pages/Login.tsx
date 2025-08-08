
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sanitizeInput, validateEmail } from "@/utils/sanitize";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Security: Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    const sanitizedPassword = password; // Don't sanitize password as it may contain special chars

    // Basic validation
    if (!sanitizedEmail || !sanitizedPassword) {
      setError('Por favor, preencha email e senha.');
      return;
    }

    // Email validation
    if (!validateEmail(sanitizedEmail)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    // Rate limiting: Prevent brute force attempts
    if (attemptCount >= 5) {
      setError('Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.');
      return;
    }

    setLoading(true);
    console.log('Submitting login form with email:', sanitizedEmail);

    try {
      const { error } = await signIn(sanitizedEmail, sanitizedPassword);

      if (error) {
        console.error('Login error:', error);
        setAttemptCount(prev => prev + 1);
        setError(error.message);
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Login successful, redirecting...');
        setAttemptCount(0); // Reset attempt count on successful login
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando...",
        });
        // Small delay to show success message before redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (error: any) {
      console.error('Login exception:', error);
      setAttemptCount(prev => prev + 1);
      const errorMessage = "Erro inesperado durante o login. Tente novamente.";
      setError(errorMessage);
      toast({
        title: "Erro inesperado",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(sanitizeInput(value));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-medical p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-medical mb-4">
            <div className="flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Almoxarifado Saúde
          </h1>
          <p className="text-sm md:text-base text-white/80">
            Sistema de Gestão de Estoque
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Entrar no Sistema</CardTitle>
            <p className="text-muted-foreground">
              Acesse sua conta para gerenciar o almoxarifado
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {attemptCount >= 3 && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Por segurança, certifique-se de que está usando as credenciais corretas.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                    maxLength={100}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="default"
                size="lg"
                disabled={loading || attemptCount >= 5}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Button variant="link" className="text-sm" disabled={loading}>
                  Esqueci minha senha
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Primeiro acesso?{' '}
                <Button variant="link" className="text-sm p-0 h-auto" disabled={loading}>
                  Solicitar credenciais
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-white/60 text-xs md:text-sm">
          <p className="mt-1 px-4">Copyright © 2025. Desenvolvido por Elissandro Oliveira. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
