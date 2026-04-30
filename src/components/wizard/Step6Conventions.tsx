import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Trophy, Handshake } from 'lucide-react';
import { NumericField } from '@/components/form/NumericField';

export interface FestivalEntry {
  id?: string;
  name: string;
  participants: number;
  qualified: number;
}

interface ConventionEntry {
  id: string;
  partner_type: string;
  count: number;
}

interface FestivalLocal {
  provinces: number;
  pct_urban: number;
  pct_rural: number;
  qualified_girls: number;
  qualified_boys: number;
}

interface Props {
  festivals: FestivalEntry[];
  onAddFestival: (f: FestivalEntry) => void;
  onUpdateFestival: (idx: number, patch: Partial<FestivalEntry>) => void;
  onRemoveFestival: (idx: number) => void;
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

export const Step6Conventions = ({
  festivals, onAddFestival, onUpdateFestival, onRemoveFestival, disabled,
}: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const partners = isAr ? PARTNER_TYPES_AR : PARTNER_TYPES_FR;

  const [conventions, setConventions] = useState<ConventionEntry[]>([]);
  const [festivalLocal, setFestivalLocal] = useState<Record<string, FestivalLocal>>({});

  const addConv = () => setConventions(p => [...p, {
    id: crypto.randomUUID(), partner_type: '', count: 0,
  }]);
  const updConv = (idx: number, patch: Partial<ConventionEntry>) =>
    setConventions(p => p.map((c, i) => i === idx ? { ...c, ...patch } : c));
  const rmConv = (idx: number) => setConventions(p => p.filter((_, i) => i !== idx));

  const getLocal = (id: string): FestivalLocal =>
    festivalLocal[id] ?? { provinces: 0, pct_urban: 0, pct_rural: 0, qualified_girls: 0, qualified_boys: 0 };
  const updLocal = (id: string, patch: Partial<FestivalLocal>) =>
    setFestivalLocal(prev => ({ ...prev, [id]: { ...getLocal(id), ...patch } }));

  return (
    <div className="space-y-5">
      {/* CONVENTIONS */}
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

      {/* FESTIVALS */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {isAr ? 'مهرجانات الشباب' : 'Festivals de jeunesse'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? 'أضف كل مهرجان مع تفاصيل الإقصائيات والمؤهلين' : 'Ajoutez chaque festival avec éliminatoires et qualifiés'}
            </p>
          </div>
          <Button type="button" size="sm"
            onClick={() => onAddFestival({ name: '', participants: 0, qualified: 0 })}
            disabled={disabled} className="gap-1.5">
            <Plus className="h-4 w-4" />
            {isAr ? 'إضافة مهرجان' : 'Ajouter un festival'}
          </Button>
        </div>

        {festivals.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
            {isAr ? 'لا توجد مهرجانات' : 'Aucun festival enregistré'}
          </div>
        ) : (
          <div className="space-y-3">
            {festivals.map((f, idx) => {
              const key = f.id ?? `idx-${idx}`;
              const loc = getLocal(key);
              return (
                <div key={key} className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
                    <Button type="button" size="icon" variant="ghost"
                      onClick={() => onRemoveFestival(idx)} disabled={disabled}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{isAr ? 'اسم المهرجان' : 'Nom du festival'}</Label>
                    <Input value={f.name} maxLength={200} className="h-9" disabled={disabled}
                      onChange={e => onUpdateFestival(idx, { name: e.target.value.slice(0, 200) })} />
                  </div>

                  <section className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isAr ? 'الإقصائيات' : 'Éliminatoires'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <NumericField label={isAr ? 'عدد العمالات' : 'Nombre de provinces'}
                        value={loc.provinces} onChange={v => updLocal(key, { provinces: v })} disabled={disabled} />
                      <NumericField label={isAr ? 'عدد المشاركين' : 'Nombre de participants'}
                        value={Number(f.participants) || 0}
                        onChange={v => onUpdateFestival(idx, { participants: v })} disabled={disabled} />
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isAr ? 'التوزيع' : 'Répartition'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <NumericField label={isAr ? '٪ حضري' : '% Urbain'}
                        value={loc.pct_urban} onChange={v => updLocal(key, { pct_urban: v })} disabled={disabled} />
                      <NumericField label={isAr ? '٪ قروي' : '% Rural'}
                        value={loc.pct_rural} onChange={v => updLocal(key, { pct_rural: v })} disabled={disabled} />
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isAr ? 'المؤهلون' : 'Qualifiés'}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <NumericField label={isAr ? 'فتيات' : 'Filles'}
                        value={loc.qualified_girls}
                        onChange={v => updLocal(key, { qualified_girls: v })} disabled={disabled} />
                      <NumericField label={isAr ? 'فتيان' : 'Garçons'}
                        value={loc.qualified_boys}
                        onChange={v => updLocal(key, { qualified_boys: v })} disabled={disabled} />
                      <NumericField label={isAr ? 'المجموع' : 'Total'}
                        value={Number(f.qualified) || (loc.qualified_girls + loc.qualified_boys)}
                        onChange={v => onUpdateFestival(idx, { qualified: v })} disabled={disabled} />
                    </div>
                  </section>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
