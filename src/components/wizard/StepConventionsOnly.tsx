import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Handshake } from 'lucide-react';
import { NumericField } from '@/components/form/NumericField';

interface ConventionEntry {
  id: string;
  partner_type: string;
  count: number;
}

interface Props {
  disabled?: boolean;
}

const PARTNER_TYPES_FR = [
  { v: 'associations', l: 'Associations' },
  { v: 'public', l: 'Secteur public' },
  { v: 'prive', l: 'Secteur privé' },
];
const PARTNER_TYPES_AR = [
  { v: 'associations', l: 'الجمعيات' },
  { v: 'public', l: 'القطاع العام' },
  { v: 'prive', l: 'القطاع الخاص' },
];

export const StepConventionsOnly = ({ disabled }: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const partners = isAr ? PARTNER_TYPES_AR : PARTNER_TYPES_FR;

  const [conventions, setConventions] = useState<ConventionEntry[]>([]);

  const addConv = () => setConventions(p => [...p, {
    id: crypto.randomUUID(), partner_type: '', count: 0,
  }]);
  const updConv = (idx: number, patch: Partial<ConventionEntry>) =>
    setConventions(p => p.map((c, i) => i === idx ? { ...c, ...patch } : c));
  const rmConv = (idx: number) => setConventions(p => p.filter((_, i) => i !== idx));

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Handshake className="h-5 w-5 text-primary" />
              {isAr ? 'الاتفاقيات والشراكات' : 'Conventions et partenariats'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? 'أضف كل اتفاقية حسب نوع الشريك' : 'Ajoutez chaque convention par type de partenaire'}
            </p>
          </div>
          <Button type="button" size="sm" onClick={addConv} disabled={disabled} className="gap-1.5">
            <Plus className="h-4 w-4" />
            {isAr ? 'إضافة' : 'Ajouter'}
          </Button>
        </div>

        {conventions.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
            {isAr ? 'لا توجد اتفاقيات' : 'Aucune convention enregistrée'}
          </div>
        ) : (
          <div className="space-y-3">
            {conventions.map((c, idx) => (
              <div key={c.id} className="border border-border rounded-lg p-4 bg-muted/20 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-7 space-y-1.5">
                  <Label className="text-xs">{isAr ? 'نوع الشريك' : 'Type de partenaire'}</Label>
                  <Select value={c.partner_type || undefined}
                    onValueChange={v => updConv(idx, { partner_type: v })}
                    disabled={disabled}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={isAr ? 'اختر' : 'Choisir'} />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map(p => <SelectItem key={p.v} value={p.v}>{p.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-4">
                  <NumericField label={isAr ? 'عدد الاتفاقيات' : 'Nombre de conventions'}
                    value={c.count} onChange={v => updConv(idx, { count: v })} disabled={disabled} />
                </div>
                <div className="sm:col-span-1">
                  <Button type="button" size="icon" variant="ghost"
                    onClick={() => rmConv(idx)} disabled={disabled}
                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
