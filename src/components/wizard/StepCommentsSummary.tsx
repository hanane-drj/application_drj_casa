import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { DraftValues } from '@/hooks/useDraftSubmission';

interface Props {
  values: DraftValues;
  onUpdate: (patch: DraftValues) => void;
  completeness: number;
  globalScore: number;
  activitiesCount: number;
  disabled?: boolean;
}

export const StepCommentsSummary = ({
  values, onUpdate, completeness, globalScore, activitiesCount, disabled,
}: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {isAr ? 'التعليقات والملخص التلقائي' : 'Commentaires et résumé automatique'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'الوقائع البارزة، الصعوبات والتوصيات' : 'Faits marquants, difficultés et recommandations'}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            {isAr ? 'التعليقات والتوصيات' : 'Commentaires et recommandations'}
          </Label>
          <Textarea
            value={(values.comments ?? '').toString()}
            onChange={e => onUpdate({ comments: e.target.value.slice(0, 5000) })}
            disabled={disabled}
            rows={8}
            placeholder={isAr
              ? 'الوقائع البارزة\nالصعوبات\nالتوصيات…'
              : 'Faits marquants\nDifficultés\nRecommandations…'}
          />
        </div>
      </Card>

      <Card className="p-5 sm:p-6 space-y-4 bg-gradient-to-br from-primary/5 via-card to-secondary/5">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {isAr ? 'الملخص التلقائي' : 'Résumé automatique'}
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {isAr ? 'نسبة الإكمال' : 'Complétude'}
            </p>
            <p className="text-2xl font-extrabold tabular-nums text-primary mt-1">{completeness}%</p>
            <Progress value={completeness} className="h-1.5 mt-2" />
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {isAr ? 'النتيجة الإجمالية' : 'Score global'}
            </p>
            <p className="text-2xl font-extrabold tabular-nums text-primary mt-1">{globalScore.toFixed(1)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {isAr ? 'الأنشطة' : 'Activités'}
            </p>
            <p className="text-2xl font-extrabold tabular-nums text-primary mt-1">{activitiesCount}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
