import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ChevronLeft, ChevronRight, Save, Send, ShieldAlert, Loader2, CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDraftSubmission } from '@/hooks/useDraftSubmission';
import { useSubmissionEntries } from '@/hooks/useSubmissionEntries';
import { SaveIndicator } from '@/components/form/SaveIndicator';
import { Stepper, type Step } from '@/components/form/Stepper';
import { Step1Identification, type IdentificationData } from '@/components/wizard/Step1Identification';
import { Step2Permanent, type AssociationEntry } from '@/components/wizard/Step2Permanent';
import { Step3Outreach } from '@/components/wizard/Step3Outreach';
import { Step4CampsFestivals, type CampEntry, type FestivalEntry } from '@/components/wizard/Step4CampsFestivals';
import { Step5SocioFacilities, type SocioEcoEntry } from '@/components/wizard/Step5SocioFacilities';
import { Step6Indicators } from '@/components/wizard/Step6Indicators';
import { usePrefName } from '@/lib/data';
import { DEFAULT_YEAR } from '@/components/YearSwitcher';

const STEPS: Step[] = [
  { id: 1, labelFr: 'Identification', labelAr: 'التعريف' },
  { id: 2, labelFr: 'Permanentes', labelAr: 'الدائمة' },
  { id: 3, labelFr: 'Rayonnantes', labelAr: 'الإشعاعية' },
  { id: 4, labelFr: 'Camping & Festivals', labelAr: 'تخييم ومهرجانات' },
  { id: 5, labelFr: 'Socio-éco & Étab.', labelAr: 'سوسيو-اقتصادي ومؤسسات' },
  { id: 6, labelFr: 'Commentaires & Résumé', labelAr: 'التعليقات والملخص' },
];

const Saisie = () => {
  const { t, i18n } = useTranslation();
  const { profile, isDirector, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const getName = usePrefName();
  const isAr = i18n.language === 'ar';

  const [year, setYear] = useState<number>(DEFAULT_YEAR);
  const [pref, setPref] = useState<any>(null);
  const [step, setStep] = useState<number>(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 metadata
  const [meta, setMeta] = useState<IdentificationData>({
    prefectureName: '',
    year: DEFAULT_YEAR,
    period: 'annuelle',
    director_name: '',
    report_date: new Date().toISOString().slice(0, 10),
  });

  // Sync meta.year ↔ wizard year
  useEffect(() => { setMeta(m => ({ ...m, year })); }, [year]);

  useEffect(() => {
    if (!profile?.prefecture_id) return;
    supabase.from('prefectures').select('*').eq('id', profile.prefecture_id).maybeSingle()
      .then(({ data }) => {
        setPref(data);
        if (data) setMeta(m => ({ ...m, prefectureName: getName(data) }));
      });
  }, [profile?.prefecture_id, getName]);

  const draft = useDraftSubmission({
    prefectureId: profile?.prefecture_id ?? '',
    year,
    userId: profile?.id ?? '',
  });

  // Hydrate meta from draft once loaded
  useEffect(() => {
    if (draft.loading) return;
    setMeta(m => ({
      ...m,
      director_name: (draft.values as any).director_name ?? m.director_name,
      report_date: (draft.values as any).report_date ?? m.report_date,
      period: (draft.values as any).period ?? m.period,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.loading, draft.submissionId]);

  // Multi-entry tables
  const assocs = useSubmissionEntries<AssociationEntry>('submission_associations', draft.submissionId);
  const camps = useSubmissionEntries<CampEntry>('submission_camps', draft.submissionId);
  const fests = useSubmissionEntries<FestivalEntry>('submission_festivals', draft.submissionId);
  const socios = useSubmissionEntries<SocioEcoEntry>('submission_socioeco', draft.submissionId);

  const persistAllChildren = async (subId: string) => {
    await Promise.all([
      assocs.persistAll(subId),
      camps.persistAll(subId),
      fests.persistAll(subId),
      socios.persistAll(subId),
    ]);
  };

  if (authLoading) {
    return (
      <AppLayout><div className="h-32 bg-muted/50 rounded-xl animate-pulse" /></AppLayout>
    );
  }

  if (!isDirector || !profile?.prefecture_id) {
    return (
      <AppLayout>
        <Card className="p-8 text-center max-w-md mx-auto">
          <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h2 className="font-bold text-lg">{t('form.forbidden.title')}</h2>
          <p className="text-sm text-muted-foreground mt-2">{t('form.forbidden.body')}</p>
        </Card>
      </AppLayout>
    );
  }

  const isLocked = draft.status === 'soumise' || draft.status === 'validee';

  const handleSaveDraft = async () => {
    // Persist meta into submissions row + child entries
    draft.update({
      ...(meta.director_name ? { director_name: meta.director_name } : {}),
      ...(meta.report_date ? { report_date: meta.report_date } : {}),
      period: meta.period,
    } as any);
    const ok = await draft.saveNow();
    if (ok && draft.submissionId) await persistAllChildren(draft.submissionId);
    if (ok) toast({ title: t('form.save.draftSavedTitle') });
    else toast({ title: t('form.save.draftErrorTitle'), variant: 'destructive' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    draft.update({
      ...(meta.director_name ? { director_name: meta.director_name } : {}),
      ...(meta.report_date ? { report_date: meta.report_date } : {}),
      period: meta.period,
    } as any);
    const ok = await draft.submit();
    if (ok && draft.submissionId) await persistAllChildren(draft.submissionId);
    setSubmitting(false);
    setConfirmOpen(false);
    if (ok) {
      toast({ title: t('form.submit.successTitle'), description: t('form.submit.successBody', { year }) });
      setTimeout(() => navigate('/dashboard'), 800);
    } else {
      toast({ title: t('form.submit.errorTitle'), description: draft.errorMsg ?? '', variant: 'destructive' });
    }
  };

  const goNext = async () => {
    // Auto-save when moving forward
    await handleSaveDraft();
    setStep(s => Math.min(STEPS.length, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goPrev = () => {
    setStep(s => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppLayout>
      <div className="space-y-5 sm:space-y-6 animate-fade-in pb-32" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl gradient-hero p-5 sm:p-7 text-primary-foreground shadow-elegant">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-white/15 text-white border-0 text-[10px] uppercase tracking-wider">
                  {t('form.eyebrow', { year })}
                </Badge>
                {isLocked && (
                  <Badge variant="outline" className="bg-success/30 text-white border-0 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t(`status.${draft.status}`)}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">{t('form.title')}</h1>
              {pref && <p className="text-sm sm:text-base opacity-90">{getName(pref)}</p>}
            </div>
          </div>
          <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full bg-secondary/30 blur-3xl" />
        </div>

        {/* Stepper */}
        <Card className="p-4 sm:p-5">
          <Stepper steps={STEPS} current={step} isAr={isAr} onJump={(id) => !isLocked && setStep(id)} />
        </Card>

        {/* Progress sticky */}
        <div className="sticky top-16 z-30 -mx-4 px-4 py-2.5 bg-background/95 backdrop-blur border-y border-border">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="text-xs font-semibold">
              {t('common.step', { n: step, total: STEPS.length })} ·{' '}
              {t('form.completeness')} <span className="text-primary tabular-nums">{draft.completeness}%</span>
            </span>
            <SaveIndicator state={draft.saveState} lastSavedAt={draft.lastSavedAt} errorMsg={draft.errorMsg} />
          </div>
          <Progress value={(step / STEPS.length) * 100} className="h-1.5" />
        </div>

        {/* Step content */}
        {draft.loading ? (
          <div className="h-64 bg-muted/40 rounded-xl animate-pulse" />
        ) : (
          <>
            {step === 1 && (
              <Step1Identification
                value={meta}
                onChange={(p) => {
                  setMeta(m => ({ ...m, ...p }));
                  if (p.year && p.year !== year) setYear(p.year);
                }}
                disabled={isLocked}
              />
            )}
            {step === 2 && (
              <Step2Permanent
                values={draft.values}
                onUpdate={(p) => draft.update(p)}
                associations={assocs.items}
                onAddAssoc={assocs.add}
                onUpdateAssoc={assocs.update}
                onRemoveAssoc={assocs.remove}
                disabled={isLocked}
              />
            )}
            {step === 3 && (
              <Step3Outreach
                values={draft.values}
                onUpdate={(p) => draft.update(p)}
                disabled={isLocked}
              />
            )}
            {step === 4 && (
              <Step4CampsFestivals
                camps={camps.items}
                onAddCamp={camps.add}
                onUpdateCamp={camps.update}
                onRemoveCamp={camps.remove}
                festivals={fests.items}
                onAddFestival={fests.add}
                onUpdateFestival={fests.update}
                onRemoveFestival={fests.remove}
                disabled={isLocked}
              />
            )}
            {step === 5 && (
              <Step5SocioFacilities
                values={draft.values}
                onUpdate={(p) => draft.update(p)}
                socioeco={socios.items}
                onAddSocio={socios.add}
                onUpdateSocio={socios.update}
                onRemoveSocio={socios.remove}
                disabled={isLocked}
              />
            )}
            {step === 6 && (
              <Step6Indicators
                values={draft.values}
                onUpdate={(p) => draft.update(p)}
                completeness={draft.completeness}
                globalScore={draft.globalScore}
                disabled={isLocked}
              />
            )}
          </>
        )}

        {/* Bottom action bar */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border">
          <div className="container py-3 flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={step === 1}
              className="gap-1.5"
            >
              {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              <span className="hidden sm:inline">{t('common.previous')}</span>
            </Button>

            <div className="flex items-center gap-2">
              {!isLocked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={draft.saveState === 'saving'}
                  className="gap-1.5"
                >
                  {draft.saveState === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span className="hidden sm:inline">{t('form.actions.saveDraft')}</span>
                </Button>
              )}

              {step < STEPS.length ? (
                <Button size="sm" onClick={goNext} className="gap-1.5" disabled={isLocked}>
                  <span className="hidden sm:inline">{t('common.next')}</span>
                  {isAr ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              ) : (
                !isLocked && (
                  <Button
                    size="sm"
                    onClick={() => setConfirmOpen(true)}
                    disabled={draft.saveState === 'saving' || submitting}
                    className="gap-1.5"
                  >
                    <Send className="h-4 w-4" />
                    {t('form.actions.submit')}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('form.confirm.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('form.confirm.body', { year, completeness: draft.completeness })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('form.confirm.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
                {t('form.confirm.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default Saisie;
