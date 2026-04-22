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
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Building2, Sparkles, Tent, Trophy, GraduationCap, Landmark,
  MessageSquare, CheckCircle2, BookOpen, Save, Send, ShieldAlert, Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FORM_SECTIONS, META_SECTIONS, type SectionDef } from '@/lib/formSchema';
import { FIELD_LABELS_FR } from '@/lib/excelTemplate';
import { useDraftSubmission } from '@/hooks/useDraftSubmission';
import { NumericField } from '@/components/form/NumericField';
import { SaveIndicator } from '@/components/form/SaveIndicator';
import { formatNumber, usePrefName } from '@/lib/data';

const ICONS = { Building2, Sparkles, Tent, Trophy, GraduationCap, Landmark, MessageSquare, CheckCircle2, BookOpen };

const YEAR = 2026;

const Saisie = () => {
  const { t, i18n } = useTranslation();
  const { profile, isDirector, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const getName = usePrefName();
  const isAr = i18n.language === 'ar';

  const [pref, setPref] = useState<any>(null);
  const [openSections, setOpenSections] = useState<string[]>(['A']);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Charger la préfecture du directeur
  useEffect(() => {
    if (!profile?.prefecture_id) return;
    supabase.from('prefectures').select('*').eq('id', profile.prefecture_id).maybeSingle()
      .then(({ data }) => setPref(data));
  }, [profile?.prefecture_id]);

  const draft = useDraftSubmission({
    prefectureId: profile?.prefecture_id ?? '',
    year: YEAR,
    userId: profile?.id ?? '',
  });

  const sectionLabel = (s: SectionDef) => (isAr ? s.titleAr : s.titleFr);
  const fieldLabel = (def: typeof FORM_SECTIONS[number]['fields'][number]) =>
    isAr ? (def.labelAr ?? FIELD_LABELS_FR[def.key] ?? def.key) : (def.labelFr ?? FIELD_LABELS_FR[def.key] ?? def.key);

  // Permissions / states
  if (authLoading) {
    return (
      <AppLayout>
        <div className="h-32 bg-muted/50 rounded-xl animate-pulse" />
      </AppLayout>
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

  const handleSubmit = async () => {
    setSubmitting(true);
    const ok = await draft.submit();
    setSubmitting(false);
    setConfirmOpen(false);
    if (ok) {
      toast({ title: t('form.submit.successTitle'), description: t('form.submit.successBody', { year: YEAR }) });
      setTimeout(() => navigate(`/directions/${profile.prefecture_id}`), 1000);
    } else {
      toast({ title: t('form.submit.errorTitle'), description: draft.errorMsg ?? '', variant: 'destructive' });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5 sm:space-y-6 animate-fade-in pb-32">
        {/* Hero compact */}
        <div className="relative overflow-hidden rounded-2xl gradient-hero p-5 sm:p-7 text-primary-foreground shadow-elegant">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-white/15 text-white border-0 text-[10px] uppercase tracking-wider">
                {t('form.eyebrow', { year: YEAR })}
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
          <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full bg-secondary/30 blur-3xl" />
        </div>

        {/* Barre de progression sticky */}
        <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-y border-border">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-semibold text-foreground">
                {t('form.completeness')} <span className="text-primary tabular-nums">{draft.completeness}%</span>
              </span>
              <span className="hidden sm:inline text-xs text-muted-foreground">·</span>
              <span className="hidden sm:inline text-xs text-muted-foreground">
                {t('form.score')}: <span className="font-semibold text-foreground tabular-nums">{draft.globalScore.toFixed(1)}</span>
              </span>
            </div>
            <SaveIndicator state={draft.saveState} lastSavedAt={draft.lastSavedAt} errorMsg={draft.errorMsg} />
          </div>
          <Progress value={draft.completeness} className="h-1.5" />
        </div>

        {draft.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted/40 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={setOpenSections}
            className="space-y-3"
          >
            {FORM_SECTIONS.map((section) => {
              const Icon = ICONS[section.icon];
              const filled = section.fields.filter(f => Number(draft.values[f.key] ?? 0) > 0).length;
              const sectionTotal = section.fields.reduce((a, f) => a + Number(draft.values[f.key] ?? 0), 0);
              return (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border border-border rounded-xl bg-card overflow-hidden data-[state=open]:shadow-elegant transition-smooth"
                >
                  <AccordionTrigger className="px-4 sm:px-5 py-4 hover:no-underline hover:bg-muted/30">
                    <div className="flex items-center gap-3 flex-1 min-w-0 text-start">
                      <div className="h-9 w-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm sm:text-base text-foreground truncate">{sectionLabel(section)}</div>
                        <div className="text-[11px] text-muted-foreground tabular-nums">
                          {filled}/{section.fields.length} {t('form.fieldsFilled')} · {formatNumber(sectionTotal, i18n.language)}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 sm:px-5 pb-5 pt-1">
                    {(isAr ? section.descriptionAr : section.descriptionFr) && (
                      <p className="text-xs text-muted-foreground mb-4">
                        {isAr ? section.descriptionAr : section.descriptionFr}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {section.fields.map(field => {
                        const computedValue = field.computed ? field.computed(draft.values) : undefined;
                        const value = computedValue !== undefined ? computedValue : Number(draft.values[field.key] ?? 0);
                        return (
                          <NumericField
                            key={field.key}
                            label={fieldLabel(field)}
                            value={value}
                            hint={isAr ? field.hintAr : field.hintFr}
                            computed={!!field.computed}
                            disabled={isLocked}
                            onChange={v => {
                              if (field.computed) return;
                              draft.update({ [field.key]: v } as any);
                              // Si on modifie filles/garçons, recalcule camping_participants
                              if (field.key === 'camping_female' || field.key === 'camping_male') {
                                const f = field.key === 'camping_female' ? v : Number(draft.values.camping_female ?? 0);
                                const m = field.key === 'camping_male' ? v : Number(draft.values.camping_male ?? 0);
                                draft.update({ camping_participants: f + m } as any);
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}

            {/* Section G : commentaires */}
            <AccordionItem value="G" className="border border-border rounded-xl bg-card overflow-hidden">
              <AccordionTrigger className="px-4 sm:px-5 py-4 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-3 flex-1 min-w-0 text-start">
                  <div className="h-9 w-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base text-foreground truncate">
                      {isAr ? META_SECTIONS.G.titleAr : META_SECTIONS.G.titleFr}
                    </div>
                    <div className="text-[11px] text-muted-foreground tabular-nums">
                      {(draft.values.comments ?? '').toString().length} / 5000
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 sm:px-5 pb-5 pt-1">
                <p className="text-xs text-muted-foreground mb-3">
                  {isAr ? META_SECTIONS.G.descriptionAr : META_SECTIONS.G.descriptionFr}
                </p>
                <Textarea
                  value={(draft.values.comments ?? '').toString()}
                  onChange={e => draft.update({ comments: e.target.value.slice(0, 5000) })}
                  placeholder={t('form.comments.placeholder')}
                  rows={6}
                  disabled={isLocked}
                  maxLength={5000}
                  className="text-sm"
                />
              </AccordionContent>
            </AccordionItem>

            {/* Section H : récap */}
            <AccordionItem value="H" className="border border-border rounded-xl bg-card overflow-hidden">
              <AccordionTrigger className="px-4 sm:px-5 py-4 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-3 flex-1 min-w-0 text-start">
                  <div className="h-9 w-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base text-foreground truncate">
                      {isAr ? META_SECTIONS.H.titleAr : META_SECTIONS.H.titleFr}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 sm:px-5 pb-5 pt-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <RecapCell label={t('form.completeness')} value={`${draft.completeness}%`} />
                  <RecapCell label={t('form.score')} value={draft.globalScore.toFixed(1)} />
                  <RecapCell label={t('detail.totalBeneficiaries')} value={formatNumber(
                    Number(draft.values.perm_educative ?? 0) + Number(draft.values.perm_cultural ?? 0) +
                    Number(draft.values.perm_sportive ?? 0) + Number(draft.values.perm_capacity ?? 0) +
                    Number(draft.values.outreach_educative ?? 0) + Number(draft.values.outreach_cultural ?? 0) +
                    Number(draft.values.outreach_sportive ?? 0) + Number(draft.values.outreach_capacity ?? 0) +
                    Number(draft.values.camping_participants ?? 0) + Number(draft.values.festivals_participants ?? 0) +
                    Number(draft.values.integration_beneficiaries ?? 0),
                    i18n.language,
                  )} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Action bar sticky bottom */}
        {!isLocked && (
          <div className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border">
            <div className="container py-3 flex items-center justify-between gap-3">
              <div className="hidden sm:block">
                <SaveIndicator state={draft.saveState} lastSavedAt={draft.lastSavedAt} errorMsg={draft.errorMsg} />
              </div>
              <div className="flex items-center gap-2 ms-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const ok = await draft.saveNow();
                    if (ok) toast({ title: t('form.save.draftSavedTitle') });
                    else toast({ title: t('form.save.draftErrorTitle'), variant: 'destructive' });
                  }}
                  disabled={draft.saveState === 'saving'}
                  className="gap-1.5"
                >
                  {draft.saveState === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span className="hidden sm:inline">{t('form.actions.saveDraft')}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                  disabled={draft.saveState === 'saving' || submitting}
                  className="gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  {t('form.actions.submit')}
                </Button>
              </div>
            </div>
          </div>
        )}

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('form.confirm.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('form.confirm.body', { year: YEAR, completeness: draft.completeness })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('form.confirm.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Send className="h-4 w-4 me-2" />}
                {t('form.confirm.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

const RecapCell = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-muted/40 p-3">
    <div className="text-[11px] text-muted-foreground leading-tight">{label}</div>
    <div className="text-xl font-extrabold text-foreground tabular-nums mt-1">{value}</div>
  </div>
);

export default Saisie;
