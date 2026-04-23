import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { AVAILABLE_YEARS } from '@/components/YearSwitcher';

export interface IdentificationData {
  prefectureName: string;
  year: number;
  period: 'annuelle' | 'trimestrielle';
  director_name: string;
  report_date: string;
}

interface Props {
  value: IdentificationData;
  onChange: (patch: Partial<IdentificationData>) => void;
  disabled?: boolean;
}

export const Step1Identification = ({ value, onChange, disabled }: Props) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <Card className="p-5 sm:p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold">{isAr ? 'التعريف' : 'Identification'}</h2>
        <p className="text-sm text-muted-foreground">
          {isAr ? 'معلومات أساسية عن التقرير' : 'Informations générales du rapport'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>{isAr ? 'المديرية الإقليمية' : 'Direction préfectorale'}</Label>
          <Input value={value.prefectureName} disabled className="h-10 bg-muted/40" />
        </div>

        <div className="space-y-1.5">
          <Label>{t('common.year')}</Label>
          <Select
            value={String(value.year)}
            onValueChange={v => onChange({ year: Number(v) })}
            disabled={disabled}
          >
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              {AVAILABLE_YEARS.map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{isAr ? 'الفترة' : 'Période'}</Label>
          <Select
            value={value.period}
            onValueChange={v => onChange({ period: v as 'annuelle' | 'trimestrielle' })}
            disabled={disabled}
          >
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="annuelle">{isAr ? 'سنوية' : 'Annuelle'}</SelectItem>
              <SelectItem value="trimestrielle">{isAr ? 'فصلية' : 'Trimestrielle'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{isAr ? 'تاريخ التقرير' : 'Date du rapport'}</Label>
          <Input
            type="date"
            value={value.report_date}
            onChange={e => onChange({ report_date: e.target.value })}
            disabled={disabled}
            className="h-10"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>{isAr ? 'اسم المدير' : 'Nom du directeur'}</Label>
          <Input
            value={value.director_name}
            onChange={e => onChange({ director_name: e.target.value.slice(0, 200) })}
            disabled={disabled}
            placeholder={isAr ? 'الاسم الكامل' : 'Nom complet'}
            className="h-10"
            maxLength={200}
          />
        </div>
      </div>
    </Card>
  );
};
