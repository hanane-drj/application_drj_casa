import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ChevronLeft, ChevronRight, Save, Send, ShieldAlert, Loader2, CheckCircle2, Pencil,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDraftSubmission } from '@/hooks/useDraftSubmission';
import { useSubmissionEntries } from '@/hooks/useSubmissionEntries';
import { SaveIndicator } from '@/components/form/SaveIndicator';
import { Stepper, type Step } from '@/components/form/Stepper';
import { Step2Permanent, type AssociationEntry } from '@/components/wizard/Step2Permanent';
import { Step3Outreach } from '@/components/wizard/Step3Outreach';
import { Step4Facilities } from '@/components/wizard/Step4Facilities';
import { Step5Camping, type CampEntry } from '@/components/wizard/Step5Camping';
import { StepConventionsOnly } from '@/components/wizard/StepConventionsOnly';
import { StepFestivalsOnly, type FestivalEntry } from '@/components/wizard/StepFestivalsOnly';
import { StepSocioEcoOnly, type SocioEcoEntry } from '@/components/wizard/StepSocioEcoOnly';
import { StepCommentsSummary } from '@/components/wizard/StepCommentsSummary';
import { PreFormSelection, type ReportSelection } from '@/components/wizard/PreFormSelection';
import { usePrefName } from '@/lib/data';
import { DEFAULT_YEAR } from '@/components/YearSwitcher';

const STEPS: Step[] = [
  { id: 1, labelFr: 'Permanentes', labelAr: 'الدائمة' },
  { id: 2, labelFr: 'Rayonnantes', labelAr: 'الإشعاعية' },
  { id: 3, labelFr: 'Établissements', labelAr: 'المؤسسات' },
  { id: 4, labelFr: 'Camping', labelAr: 'التخييم' },
  { id: 5, labelFr: 'Conventions', labelAr: 'الاتفاقيات' },
  { id: 6, labelFr: 'Festivals', labelAr: 'المهرجانات' },
  { id: 7, labelFr: 'Socio-éco', labelAr: 'سوسيو-اقتصادي' },
  { id: 8, labelFr: 'Résumé', labelAr: 'الملخص' },
];

const DOMAIN_LABEL: Record<string, { fr: string; ar: string }> = {
  jeunesse: { fr: 'Jeunesse', ar: 'الشباب' },
  femme: { fr: 'Femme / Fille', ar: 'المرأة / الفتاة' },
  enfants: { fr: 'Enfants', ar: 'الأطفال' },
  creche: { fr: 'Crèche', ar: 'الحضانة' },
};

const Saisie = () => {
  const { t, i18n } = useTranslation();
  const { profile, isDirector, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const getName = usePrefName();
  const isAr = i18n.language === 'ar';

  // Pre-form selection
  const [selectionDone, setSelectionDone] = useState(false);
  const [selection, setSelection] = useState<ReportSelection>({
    year: DEFAULT_YEAR,
    type: 'annuel',
    domain: 'jeunesse',
  });

  const [pref, setPref] = useState<any>(null);
  const [step, setStep] = useState<number>(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Identification metadata (director_name, report_date) — persisted with draft
  const [directorName, setDirectorName] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));

  // Per-step "Milieu territorial"
  const [permMilieu, setPermMilieu] = useState<'urbain' | 'rural' | ''>('');
  const [outreachMilieu, setOutreachMilieu] = useState<'urbain' | 'rural' | ''>('');

  useEffect(() => {
    if (!profile?.prefecture_id) return;
    supabase.from('prefectures').select('*').eq('id', profile.prefecture_id).maybeSingle()
      .then(({ data }) => setPref(data));
  }, [profile?.prefecture_id]);

  const draft = useDraftSubmission({
    prefectureId: profile?.prefecture_id ?? '',
    year: selection.year,
    userId: profile?.id ?? '',
  });

  // Hydrate identification fields from draft once loaded
  useEffect(() => {
    if (draft.loading) return;
    const v: any = draft.values;
    if (v.director_name) setDirectorName(v.director_name);
    if (v.report_date) setReportDate(v.report_date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.loading, draft.submissionId]);

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

  // PRE-FORM SELECTION FLOW (Stages 1 & 2)
  if (!selectionDone) {
    return (
      <AppLayout>
        <div className="space-y-5 sm:space-y-6 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="relative overflow-hidden rounded-2xl gradient-hero p-5 sm:p-7 text-primary-foreground shadow-elegant">
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">{t('form.title')}</h1>
              {pref && <p className="text-sm sm:text-base opacity-90 mt-1">{getName(pref)}</p>}
            </div>
            <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full bg-secondary/30 blur-3xl" />
          </div>
          <PreFormSelection
            initial={selection}
            onComplete={(sel) => { setSelection(sel); setSelectionDone(true); }}
          />
        </div>
      </AppLayout>
    );
  }

  const isLocked = draft.status === 'soumise' || draft.status === 'validee';

  const periodLabel = selection.type === 'annuel'
    ? (isAr ? 'سنوي' : 'Annuel')
    : `${isAr ? 'فصلي' : 'Trimestriel'} · ${selection.quarter ?? ''}`;
  const domainLabel = DOMAIN_LABEL[selection.domain]?.[isAr ? 'ar' : 'fr'] ?? selection.domain;

  const handleSaveDraft = async () => {
    draft.update({
      ...(directorName ? { director_name: directorName } : {}),
      ...(reportDate ? { report_date: reportDate } : {}),
      period: selection.type === 'annuel' ? 'annuelle' : 'trimestrielle',
    } as any);
    const ok = await draft.saveNow();
    if (ok && draft.submissionId) await persistAllChildren(draft.submissionId);
    if (ok) toast({ title: t('form.save.draftSavedTitle') });
    else toast({ title: t('form.save.draftErrorTitle'), variant: 'destructive' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    draft.update({
      ...(directorName ? { director_name: directorName } : {}),
      ...(reportDate ? { report_date: reportDate } : {}),
      period: selection.type === 'annuel' ? 'annuelle' : 'trimestrielle',
    } as any);
    const ok = await draft.submit();
    if (ok && draft.submissionId) await persistAllChildren(draft.submissionId);
    setSubmitting(false);
    setConfirmOpen(false);
    if (ok) {
      toast({ title: t('form.submit.successTitle'), description: t('form.submit.successBody', { year: selection.year }) });
      setTimeout(() => navigate('/dashboard'), 800);
    } else {
      toast({ title: t('form.submit.errorTitle'), description: draft.errorMsg ?? '', variant: 'destructive' });
    }
  };

  const goNext = async () => {
    await handleSaveDraft();
    setStep(s => Math.min(STEPS.length, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goPrev = () => {
    setStep(s => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalActivities = socios.items.length;

  return (
    <AppLayout>
      <div className="space-y-5 sm:space-y-6 animate-fade-in pb-32" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl gradient-hero p-5 sm:p-7 text-primary-foreground shadow-elegant">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
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

        {/* Selection summary */}
        <Card className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              <span className="text-muted-foreground">{isAr ? 'السنة' : 'Année'}:</span>
              <span className="font-bold tabular-nums">{selection.year}</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <span className="text-muted-foreground">{isAr ? 'النوع' : 'Type'}:</span>
              <span className="font-bold">{periodLabel}</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <span className="text-muted-foreground">{isAr ? 'المجال' : 'Domaine'}:</span>
              <span className="font-bold">{domainLabel}</span>
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectionDone(false)} className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            {isAr ? 'تعديل' : 'Modifier'}
          </Button>
        </Card>

        {/* Identification (compact) */}
        <Card className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{isAr ? 'اسم المدير(ة)' : 'Nom du directeur(trice)'}</Label>
            <Input
              value={directorName}
              maxLength={200}
              onChange={e => setDirectorName(e.target.value.slice(0, 200))}
              disabled={isLocked}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{isAr ? 'تاريخ التقرير' : 'Date du rapport'}</Label>
            <Input
              type="date"
              value={reportDate}
              onChange={e => setReportDate(e.target.value)}
              disabled={isLocked}
              className="h-9"
            />
          </div>
        </Card>

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
              <Step2Permanent
                values={draft.values}
                onUpdate={(p) => draft.update(p)}
                milieu={permMilieu}
                onMilieuChange={setPermMilieu}
                disabled={isLocked}
              />
            )}
            {step === 2 && (
              <Step3Outreach
                values={draft.values}
                onUpdate={(p) => draft.update(p)}
                milieu={outreachMilieu}
                onMilieuChange={setOutreachMilieu}
                disabled={isLocked}
              />
            )}
            {step === 3 && (
              <Step4Facilities disabled={isLocked} />
            )}
            {step === 4 && (
              <Step5Camping
                camps={camps.items}
                onAddCamp={camps.add}
                onUpdateCamp={camps.update}
                onRemoveCamp={camps.remove}
                disabled={isLocked}
              />
            )}
            {step === 5 && (
              <StepConventionsOnly disabled={isLocked} />
            )}
            {step === 6 && (
              <StepFestivalsOnly
                festivals={fests.items}
                onAddFestival={fests.add}
                onUpdateFestival={fests.update}
                onRemoveFestival={fests.remove}
                disabled={isLocked}
              />
            )}
            {step === 7 && (
              <StepSocioEcoOnly
                socioeco={socios.items}
                onAddSocio={socios.add}
                onUpdateSocio={socios.update}
                onRemoveSocio={socios.remove}
                disabled={isLocked}
              />
            )}
            {step === 8 && (
              <StepCommentsSummary
                values={draft.values}
                onUpdate={(p) => draft.update(p)}
                completeness={draft.completeness}
                globalScore={draft.globalScore}
                activitiesCount={totalActivities}
                disabled={isLocked}
              />
            )}
          </>
        )}

        {/* Bottom action bar */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border">
          <div className="container py-3 flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={goPrev} disabled={step === 1} className="gap-1.5">
              {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              <span className="hidden sm:inline">{t('common.previous')}</span>
            </Button>

            <div className="flex items-center gap-2">
              {!isLocked && (
                <Button variant="outline" size="sm" onClick={handleSaveDraft}
                  disabled={draft.saveState === 'saving'} className="gap-1.5">
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
                  <Button size="sm" onClick={() => setConfirmOpen(true)}
                    disabled={draft.saveState === 'saving' || submitting} className="gap-1.5">
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
                {t('form.confirm.body', { year: selection.year, completeness: draft.completeness })}
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
