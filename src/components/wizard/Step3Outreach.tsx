import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NumericField } from '@/components/form/NumericField';
import type { DraftValues } from '@/hooks/useDraftSubmission';

interface Props {
  values: DraftValues;
  onUpdate: (patch: DraftValues) => void;
  disabled?: boolean;
}

export const Step3Outreach = ({ values, onUpdate, disabled }: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold">
            {isAr ? 'الأنشطة الإشعاعية' : 'Activités rayonnantes'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'المستفيدون حسب نوع النشاط' : 'Bénéficiaires par type d’activité'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NumericField
            label={isAr ? 'المستفيدون التربويون' : 'Bénéficiaires éducatifs'}
            value={Number(values.outreach_educative ?? 0)}
            onChange={v => onUpdate({ outreach_educative: v })}
            disabled={disabled}
          />
          <NumericField
            label={isAr ? 'المستفيدون الثقافيون' : 'Bénéficiaires culturels'}
            value={Number(values.outreach_cultural ?? 0)}
            onChange={v => onUpdate({ outreach_cultural: v })}
            disabled={disabled}
          />
          <NumericField
            label={isAr ? 'المستفيدون الرياضيون' : 'Bénéficiaires sportifs'}
            value={Number(values.outreach_sportive ?? 0)}
            onChange={v => onUpdate({ outreach_sportive: v })}
            disabled={disabled}
          />
          <NumericField
            label={isAr ? 'تعزيز القدرات' : 'Renforcement capacités'}
            value={Number(values.outreach_capacity ?? 0)}
            onChange={v => onUpdate({ outreach_capacity: v })}
            disabled={disabled}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            {isAr ? 'ملاحظات' : 'Notes'}
          </Label>
          <Textarea
            value={(values.comments ?? '').toString()}
            onChange={e => onUpdate({ comments: e.target.value.slice(0, 5000) })}
            disabled={disabled}
            rows={3}
            placeholder={isAr ? 'ملاحظات حول الأنشطة الإشعاعية…' : 'Notes sur les activités rayonnantes…'}
          />
        </div>
      </Card>
    </div>
  );
};
