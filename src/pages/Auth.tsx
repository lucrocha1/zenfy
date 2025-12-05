import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import logo from '@/assets/logo.png';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const emailSchema = z.object({
  email: z.string().email('Email inválido'),
});

type AuthView = 'login' | 'signup' | 'forgot-password' | 'signup-success' | 'reset-sent';

const Auth = () => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { user, signIn, signUp, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = (emailOnly = false) => {
    const schema = emailOnly ? emailSchema : authSchema;
    const data = emailOnly ? { email } : { email, password };
    const result = schema.safeParse(data);
    
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    const isLogin = view === 'login';
    const { error } = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password);

    setIsSubmitting(false);

    if (error) {
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado';
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return;
    }

    if (!isLogin) {
      setView('signup-success');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(true)) return;
    
    setIsSubmitting(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    
    setIsSubmitting(false);
    
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o email de recuperação',
        variant: 'destructive',
      });
      return;
    }
    
    setView('reset-sent');
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível conectar com o Google',
        variant: 'destructive',
      });
    }
  };

  const resetToLogin = () => {
    setView('login');
    setEmail('');
    setPassword('');
    setErrors({});
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </main>
    );
  }

  // Success screens
  if (view === 'signup-success') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Conta criada!</CardTitle>
            <CardDescription className="text-base">
              Enviamos um email de confirmação para <strong className="text-foreground">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
              <p>📬 Verifique sua caixa de entrada</p>
              <p>📁 Se não encontrar, confira a pasta de spam</p>
              <p>✨ Clique no link para ativar sua conta</p>
            </div>
            <Button onClick={resetToLogin} className="w-full">
              Voltar para o login
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (view === 'reset-sent') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Email enviado!</CardTitle>
            <CardDescription className="text-base">
              Enviamos instruções de recuperação para <strong className="text-foreground">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
              <p>📬 Verifique sua caixa de entrada</p>
              <p>📁 Se não encontrar, confira a pasta de spam</p>
              <p>🔗 Clique no link para redefinir sua senha</p>
            </div>
            <Button onClick={resetToLogin} className="w-full">
              Voltar para o login
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Forgot password screen
  if (view === 'forgot-password') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img src={logo} alt="Zenfy" className="w-20 h-20 mx-auto mb-2 dark:invert" />
            <CardTitle className="text-2xl">Recuperar senha</CardTitle>
            <CardDescription>
              Digite seu email para receber as instruções
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
              </Button>
            </form>
            
            <button
              type="button"
              onClick={() => setView('login')}
              className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const isLogin = view === 'login';

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={logo} alt="Zenfy" className="w-20 h-20 mx-auto mb-2 dark:invert" />
          <CardTitle className="text-2xl">Zenfy</CardTitle>
          <CardDescription>
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar com Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            
            {isLogin && (
              <button
                type="button"
                onClick={() => setView('forgot-password')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Esqueci minha senha
              </button>
            )}
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setView(isLogin ? 'signup' : 'login')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? 'Não tem conta? Criar conta' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Auth;
