import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Brand, BrandMark } from '@/components/Brand';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { toast } from 'sonner';
import { Loader2, Sparkles, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate('/dashboard', { replace: true });
  }, [user, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(t('auth.errorInvalid'));
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col gradient-soft">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4">
        <Brand compact />
        <LanguageSwitcher />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Hero side */}
          <div className="hidden lg:flex flex-col gap-6 p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              {t('app.ministry')}
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight text-foreground">
              {t('app.fullName')}
              <span className="block text-gradient mt-2">Casablanca-Settat</span>
            </h1>
            <p className="text-lg text-muted-foreground">{t('auth.loginSubtitle')}</p>
          </div>

          {/* Form */}
          <Card className="p-6 sm:p-8 shadow-elegant border-border/60 bg-card/95 backdrop-blur animate-scale-in">
            <div className="lg:hidden flex justify-center mb-4">
              <BrandMark size="lg" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t('auth.loginTitle')}</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6">{t('auth.loginSubtitle')}</p>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-11 pe-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? t('common.hide') : t('common.show')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 gradient-primary hover:opacity-95 text-primary-foreground font-semibold shadow-elegant">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin me-2" />{t('auth.loading')}</> : t('auth.signIn')}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <Link
                to="/admin/provision"
                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-smooth"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {t('provision.title')}
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;
