import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { DraftValues } from '@/hooks/useDraftSubmission';

interface Props {
  values: DraftValues;
  onUpdate: (patch: DraftValues) => void;
  completeness: number;
  globalScore: number;
  disabled?: boolean;
}

export const Step6Indicators = ({
  values, onUpdate, completeness, globalScore, disabled,
}: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

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
          rows={8}
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
