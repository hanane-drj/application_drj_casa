import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Target, MessageSquare, BarChart3 } from 'lucide-react';
import { NumericField } from '@/components/form/NumericField';
import { Progress } from '@/components/ui/progress';
import type { DraftValues } from '@/hooks/useDraftSubmission';

export interface IndicatorEntry {
  id?: string;
  program: string;
  label: string;
  target_value: number;
  actual_value: number;
}

interface Props {
  values: DraftValues;
  onUpdate: (patch: DraftValues) => void;
  indicators: IndicatorEntry[];
  onAddIndicator: (i: IndicatorEntry) => void;
  onUpdateIndicator: (idx: number, patch: Partial<IndicatorEntry>) => void;
  onRemoveIndicator: (idx: number) => void;
  completeness: number;
  globalScore: number;
  disabled?: boolean;
}

const PROGRAMS_FR = ['Programme jeunesse', 'Partenariats', 'Réclamations', 'Autre'];
const PROGRAMS_AR = ['برنامج الشباب', 'الشراكات', 'الشكايات', 'أخرى'];

export const Step6Indicators = ({
  values, onUpdate, indicators,
  onAddIndicator, onUpdateIndicator, onRemoveIndicator,
  completeness, globalScore, disabled,
}: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const programs = isAr ? PROGRAMS_AR : PROGRAMS_FR;

  // Group indicators by program
  const grouped = useMemo(() => {
    const map = new Map<string, { entry: IndicatorEntry; idx: number }[]>();
    indicators.forEach((entry, idx) => {
      const key = entry.program || (isAr ? 'بدون برنامج' : 'Sans programme');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ entry, idx });
    });
    return Array.from(map.entries());
  }, [indicators, isAr]);

  const totalBeneficiaries =
    (Number(values.perm_educative) || 0) +
    (Number(values.perm_cultural) || 0) +
    (Number(values.perm_sportive) || 0) +
    (Number(values.perm_capacity) || 0) +
    (Number(values.outreach_educative) || 0) +
    (Number(values.outreach_cultural) || 0) +
    (Number(values.outreach_sportive) || 0) +
    (Number(values.outreach_capacity) || 0);

  return (
    <div className="space-y-5">
      {/* INDICATORS */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {isAr ? 'المؤشرات حسب البرنامج' : 'Indicateurs par programme'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? 'القيمة المستهدفة مقابل المنجزة' : 'Valeurs cibles vs. réalisées'}
            </p>
          </div>
          <Button
            type="button" size="sm"
            onClick={() => onAddIndicator({
              program: programs[0], label: '', target_value: 0, actual_value: 0,
            })}
            disabled={disabled} className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {isAr ? 'إضافة مؤشر' : 'Ajouter un indicateur'}
          </Button>
        </div>

        {indicators.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
            {isAr ? 'لا توجد مؤشرات' : 'Aucun indicateur enregistré'}
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map(([program, rows]) => (
              <div key={program} className="space-y-3">
                <h3 className="text-sm font-bold text-primary">{program}</h3>
                {rows.map(({ entry, idx }) => {
                  const target = Number(entry.target_value) || 0;
                  const actual = Number(entry.actual_value) || 0;
                  const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
                  return (
                    <div key={entry.id ?? idx} className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
                        <Button
                          type="button" size="icon" variant="ghost"
                          onClick={() => onRemoveIndicator(idx)} disabled={disabled}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">{isAr ? 'البرنامج' : 'Programme'}</Label>
                          <Select
                            value={entry.program || undefined}
                            onValueChange={v => onUpdateIndicator(idx, { program: v })}
                            disabled={disabled}
                          >
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {programs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">{isAr ? 'العنوان' : 'Libellé'}</Label>
                          <Input
                            value={entry.label} maxLength={200}
                            onChange={e => onUpdateIndicator(idx, { label: e.target.value.slice(0, 200) })}
                            disabled={disabled} className="h-9"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 items-end">
                        <NumericField
                          label={isAr ? 'القيمة المستهدفة' : 'Valeur cible'}
                          value={target}
                          onChange={v => onUpdateIndicator(idx, { target_value: v })}
                          disabled={disabled}
                        />
                        <NumericField
                          label={isAr ? 'القيمة المنجزة' : 'Valeur réelle'}
                          value={actual}
                          onChange={v => onUpdateIndicator(idx, { actual_value: v })}
                          disabled={disabled}
                        />
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            {isAr ? '٪ الإنجاز' : '% réalisation'}
                          </Label>
                          <div className="h-11 flex items-center justify-end px-3 rounded-md bg-muted/60 font-bold tabular-nums text-primary">
                            {pct}%
                          </div>
                        </div>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* COMMENTS */}
      <Card className="p-5 sm:p-6 space-y-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {isAr ? 'التعليقات' : 'Commentaires'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'الوقائع البارزة، الصعوبات، التوصيات' : 'Faits marquants, difficultés, recommandations'}
          </p>
        </div>
        <Textarea
          value={(values.comments ?? '').toString()}
          onChange={e => onUpdate({ comments: e.target.value.slice(0, 5000) })}
          disabled={disabled}
          rows={6}
          placeholder={isAr
            ? 'الوقائع البارزة\nالصعوبات\nالتوصيات…'
            : 'Faits marquants\nDifficultés\nRecommandations…'}
        />
      </Card>

      {/* SUMMARY */}
      <Card className="p-5 sm:p-6 space-y-4 bg-gradient-to-br from-primary/5 via-card to-secondary/5">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {isAr ? 'الملخص التلقائي' : 'Résumé automatique'}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-card border border-border p-4">
            <div className="text-xs text-muted-foreground">
              {isAr ? 'إجمالي المستفيدين' : 'Total bénéficiaires'}
            </div>
            <div className="text-2xl font-extrabold tabular-nums mt-1">
              {totalBeneficiaries.toLocaleString(isAr ? 'ar' : 'fr')}
            </div>
          </div>
          <div className="rounded-lg bg-card border border-border p-4">
            <div className="text-xs text-muted-foreground">
              {isAr ? 'النتيجة الشاملة' : 'Score global'}
            </div>
            <div className="text-2xl font-extrabold tabular-nums mt-1 text-primary">
              {globalScore.toFixed(1)}
            </div>
          </div>
          <div className="rounded-lg bg-card border border-border p-4">
            <div className="text-xs text-muted-foreground">
              {isAr ? 'نسبة الاكتمال' : 'Complétude'}
            </div>
            <div className="text-2xl font-extrabold tabular-nums mt-1 text-success">
              {completeness}%
            </div>
            <Progress value={completeness} className="h-1.5 mt-2" />
          </div>
        </div>
      </Card>
    </div>
  );
};
