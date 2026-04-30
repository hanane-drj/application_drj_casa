import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { NumericField } from '@/components/form/NumericField';
import type { DraftValues } from '@/hooks/useDraftSubmission';

// Kept for backward compatibility with Saisie.tsx (associations now live in Step5Camping).
export interface AssociationEntry {
  id?: string;
  name: string;
  domain: string;
  movement_type: 'entrante' | 'sortante';
  movement_date: string;
  motif: string;
}

interface Props {
  values: DraftValues;
  onUpdate: (patch: DraftValues) => void;
  milieu: 'urbain' | 'rural' | '';
  onMilieuChange: (m: 'urbain' | 'rural' | '') => void;
  disabled?: boolean;
}

export const Step2Permanent = ({ values, onUpdate, milieu, onMilieuChange, disabled }: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold">{isAr ? 'الأنشطة الدائمة' : 'Activités permanentes'}</h2>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'النوادي والأنشطة الدائمة' : 'Clubs et activités permanentes'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{isAr ? 'الوسط الترابي' : 'Milieu territorial'}</Label>
            <Select
              value={milieu || undefined}
              onValueChange={v => onMilieuChange(v as 'urbain' | 'rural')}
              disabled={disabled}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder={isAr ? 'اختر' : 'Choisir'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urbain">{isAr ? 'حضري' : 'Urbain'}</SelectItem>
                <SelectItem value="rural">{isAr ? 'قروي' : 'Rural'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <NumericField
            label={isAr ? 'عدد النوادي' : 'Nombre de clubs'}
            value={Number(values.perm_clubs ?? 0)}
            onChange={v => onUpdate({ perm_clubs: v })}
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NumericField
            label={isAr ? 'الأنشطة التربوية' : 'Activités éducatives'}
            value={Number(values.perm_educative ?? 0)}
            onChange={v => onUpdate({ perm_educative: v })}
            disabled={disabled}
          />
          <NumericField
            label={isAr ? 'الأنشطة الثقافية والفنية' : 'Activités culturelles et artistiques'}
            value={Number(values.perm_cultural ?? 0)}
            onChange={v => onUpdate({ perm_cultural: v })}
            disabled={disabled}
          />
          <NumericField
            label={isAr ? 'الأنشطة الترفيهية والبدنية' : 'Activités récréatives et physiques'}
            value={Number(values.perm_sportive ?? 0)}
            onChange={v => onUpdate({ perm_sportive: v })}
            disabled={disabled}
          />
          <NumericField
            label={isAr ? 'تعزيز القدرات' : 'Renforcement des capacités'}
            value={Number(values.perm_capacity ?? 0)}
            onChange={v => onUpdate({ perm_capacity: v })}
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
            placeholder={isAr ? 'ملاحظات…' : 'Notes…'}
          />
        </div>
      </Card>
    </div>
  );
};
