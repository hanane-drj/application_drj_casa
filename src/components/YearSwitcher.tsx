import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export const AVAILABLE_YEARS = [2025, 2026] as const;
export type CampaignYear = (typeof AVAILABLE_YEARS)[number];
export const DEFAULT_YEAR: CampaignYear = 2026;

interface Props {
  value: number;
  onChange: (y: number) => void;
  className?: string;
}

export const YearSwitcher = ({ value, onChange, className }: Props) => {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="h-9 gap-1.5 min-w-[100px] bg-card">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_YEARS.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {t('common.year')} {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
