import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { Brand } from '@/components/Brand';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Loader2, ShieldCheck, Eye, EyeOff, FileSpreadsheet, FileJson,
  CheckCircle2, AlertTriangle, KeyRound,
} from 'lucide-react';

interface Credential {
  email: string;
  password: string;
  role: string;
  prefecture_code: string | null;
  prefecture_name: string | null;
  full_name: string;
  status: 'created' | 'reset' | 'error';
  error?: string;
}

const Provision = () => {
  const { t } = useTranslation();
  const [secret, setSecret] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    credentials: Credential[];
    created: number;
    reset: number;
    errors: number;
    generated_at: string;
  } | null>(null);

  const handleProvision = async () => {
    if (!secret.trim()) {
      toast.error(t('provision.errEmpty'));
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('provision-users', {
        method: 'POST',
        headers: { 'x-seed-secret': secret.trim() },
      });
      if (error) {
        // supabase.functions.invoke wraps errors loosely — extract status if possible
        const msg = (error as any)?.context?.error
          ?? (error as any)?.message
          ?? 'Unknown error';
        toast.error(t('provision.errFailed', { msg }));
        setLoading(false);
        return;
      }
      if (data?.error) {
        toast.error(t('provision.errFailed', { msg: data.error }));
        setLoading(false);
        return;
      }
      setResult({
        credentials: data.credentials,
        created: data.created,
        reset: data.reset,
        errors: data.errors,
        generated_at: data.generated_at,
      });
      toast.success(t('provision.successToast', { count: data.total }));
    } catch (e: any) {
      toast.error(t('provision.errFailed', { msg: e?.message ?? '' }));
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drj-cs-credentials-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadXlsx = () => {
    if (!result) return;
    const wb = XLSX.utils.book_new();
    const header = ['Email', 'Mot de passe', 'Rôle', 'Code', 'Préfecture', 'Nom complet', 'Statut'];
    const body = result.credentials.map(c => [
      c.email,
      c.password,
      c.role,
      c.prefecture_code ?? '',
      c.prefecture_name ?? '',
      c.full_name,
      c.status,
    ]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
    ws['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 22 }, { wch: 6 }, { wch: 36 }, { wch: 32 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Comptes');
    XLSX.writeFile(wb, `drj-cs-credentials-${Date.now()}.xlsx`);
  };

  return (
    <div className="min-h-screen flex flex-col gradient-soft">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4">
        <Brand compact />
        <LanguageSwitcher />
      </header>

      <main className="flex-1 container max-w-3xl py-8 space-y-6">
        <Card className="p-6 sm:p-8 shadow-elegant">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-foreground">{t('provision.title')}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t('provision.subtitle')}</p>
            </div>
          </div>

          <Alert className="mt-6 border-warning/30 bg-warning/5">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-xs">{t('provision.warning')}</AlertDescription>
          </Alert>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secret">{t('provision.secretLabel')}</Label>
              <div className="relative">
                <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="secret"
                  type={show ? 'text' : 'password'}
                  value={secret}
                  onChange={e => setSecret(e.target.value)}
                  placeholder={t('provision.secretPlaceholder')}
                  className="ps-10 pe-10 font-mono"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={show ? t('common.hide') : t('common.show')}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">{t('provision.secretHint')}</p>
            </div>

            <Button
              onClick={handleProvision}
              disabled={loading || !secret.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <ShieldCheck className="h-4 w-4 me-2" />}
              {loading ? t('provision.loading') : t('provision.cta')}
            </Button>
          </div>
        </Card>

        {result && (
          <Card className="p-6 sm:p-8 shadow-elegant animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-success" />
              <h2 className="text-xl font-bold">{t('provision.resultTitle')}</h2>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-lg bg-success/10 p-3 text-center">
                <div className="text-2xl font-extrabold text-success">{result.created}</div>
                <div className="text-[11px] text-muted-foreground">{t('provision.created')}</div>
              </div>
              <div className="rounded-lg bg-info/10 p-3 text-center">
                <div className="text-2xl font-extrabold text-info">{result.reset}</div>
                <div className="text-[11px] text-muted-foreground">{t('provision.reset')}</div>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3 text-center">
                <div className="text-2xl font-extrabold text-destructive">{result.errors}</div>
                <div className="text-[11px] text-muted-foreground">{t('provision.errors')}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Button onClick={downloadXlsx} className="gap-2" variant="default">
                <FileSpreadsheet className="h-4 w-4" />
                {t('provision.downloadXlsx')}
              </Button>
              <Button onClick={downloadJson} className="gap-2" variant="outline">
                <FileJson className="h-4 w-4" />
                {t('provision.downloadJson')}
              </Button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-start font-semibold">Email</th>
                      <th className="px-3 py-2 text-start font-semibold">{t('provision.password')}</th>
                      <th className="px-3 py-2 text-start font-semibold">{t('provision.role')}</th>
                      <th className="px-3 py-2 text-start font-semibold">{t('provision.prefecture')}</th>
                      <th className="px-3 py-2 text-start font-semibold">{t('provision.statusCol')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.credentials.map((c) => (
                      <tr key={c.email} className="border-t border-border">
                        <td className="px-3 py-2 font-mono">{c.email}</td>
                        <td className="px-3 py-2 font-mono">{c.password}</td>
                        <td className="px-3 py-2">{c.role}</td>
                        <td className="px-3 py-2">{c.prefecture_code ?? '—'}</td>
                        <td className="px-3 py-2">
                          <span className={
                            c.status === 'created' ? 'text-success font-semibold' :
                            c.status === 'reset' ? 'text-info font-semibold' :
                            'text-destructive font-semibold'
                          }>
                            {t(`provision.status.${c.status}`)}
                          </span>
                          {c.error && <div className="text-[10px] text-destructive">{c.error}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-4">{t('provision.savedNotice')}</p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Provision;
