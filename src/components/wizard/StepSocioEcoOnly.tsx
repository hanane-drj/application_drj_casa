import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Landmark } from 'lucide-react';
import { NumericField } from '@/components/form/NumericField';

export interface SocioEcoEntry {
  id?: string;
  subject: string;
  activity_type: string;
  partner: string;
  duration: string;
  men: number;
  women: number;
  urban_pct: number;
  rural_pct: number;
}

interface Props {
  socioeco: SocioEcoEntry[];
  onAddSocio: (s: SocioEcoEntry) => void;
  onUpdateSocio: (idx: number, patch: Partial<SocioEcoEntry>) => void;
  onRemoveSocio: (idx: number) => void;
  disabled?: boolean;
}

const PARTNER_TYPES_FR = [
  { v: 'prive', l: 'Secteur privé' },
  { v: 'civile', l: 'Société civile' },
  { v: 'public', l: 'Secteur public' },
];
const PARTNER_TYPES_AR = [
  { v: 'prive', l: 'القطاع الخاص' },
  { v: 'civile', l: 'المجتمع المدني' },
  { v: 'public', l: 'القطاع العام' },
];

const THEME_FR = [
  { v: 'formation', l: 'Formation' },
  { v: 'sensibilisation', l: 'Sensibilisation' },
  { v: 'ateliers', l: 'Ateliers' },
  { v: 'conference', l: 'Conférence' },
];
const THEME_AR = [
  { v: 'formation', l: 'تكوين' },
  { v: 'sensibilisation', l: 'تحسيس' },
  { v: 'ateliers', l: 'ورشات' },
  { v: 'conference', l: 'مؤتمر' },
];

export const StepSocioEcoOnly = ({
  socioeco, onAddSocio, onUpdateSocio, onRemoveSocio, disabled,
}: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const partners = isAr ? PARTNER_TYPES_AR : PARTNER_TYPES_FR;
  const themes = isAr ? THEME_AR : THEME_FR;

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              {isAr ? 'الإدماج السوسيو-اقتصادي' : 'Intégration socio-économique'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? 'أضف كل نشاط على حدة' : 'Ajoutez chaque activité individuellement'}
            </p>
          </div>
          <Button type="button" size="sm" onClick={() => onAddSocio({
            subject: '', activity_type: '', partner: '', duration: '',
            men: 0, women: 0, urban_pct: 0, rural_pct: 0,
          })} disabled={disabled} className="gap-1.5">
            <Plus className="h-4 w-4" />
            {isAr ? 'إضافة' : 'Ajouter'}
          </Button>
        </div>

        {socioeco.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
            {isAr ? 'لا توجد أنشطة' : 'Aucune activité enregistrée'}
          </div>
        ) : (
          <div className="space-y-3">
            {socioeco.map((s, idx) => (
              <div key={s.id ?? idx} className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
                  <Button type="button" size="icon" variant="ghost"
                    onClick={() => onRemoveSocio(idx)} disabled={disabled}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{isAr ? 'نوع الشريك' : 'Type de partenaire'}</Label>
                    <Select value={s.partner || undefined}
                      onValueChange={v => onUpdateSocio(idx, { partner: v })}
                      disabled={disabled}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={isAr ? 'اختر' : 'Choisir'} />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map(p => <SelectItem key={p.v} value={p.v}>{p.l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">{isAr ? "مدة النشاط" : "Durée de l'activité"}</Label>
                    <Input
                      value={s.duration} maxLength={100}
                      placeholder={isAr ? 'مثال: 3 أيام' : 'Ex: 3 jours'}
                      onChange={e => onUpdateSocio(idx, { duration: e.target.value.slice(0, 100) })}
                      disabled={disabled} className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">{isAr ? 'الموضوع' : 'Thème'}</Label>
                    <Select value={s.activity_type || undefined}
                      onValueChange={v => onUpdateSocio(idx, { activity_type: v })}
                      disabled={disabled}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={isAr ? 'اختر' : 'Choisir'} />
                      </SelectTrigger>
                      <SelectContent>
                        {themes.map(t => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {isAr ? 'المشاركون' : 'Participants'}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <NumericField label={isAr ? '٪ حضري' : '% Urbain'} value={Number(s.urban_pct) || 0}
                      onChange={v => onUpdateSocio(idx, { urban_pct: v })} disabled={disabled} />
                    <NumericField label={isAr ? '٪ قروي' : '% Rural'} value={Number(s.rural_pct) || 0}
                      onChange={v => onUpdateSocio(idx, { rural_pct: v })} disabled={disabled} />
                    <NumericField label={isAr ? 'فتيات' : 'Filles'} value={Number(s.women) || 0}
                      onChange={v => onUpdateSocio(idx, { women: v })} disabled={disabled} />
                    <NumericField label={isAr ? 'فتيان' : 'Garçons'} value={Number(s.men) || 0}
                      onChange={v => onUpdateSocio(idx, { men: v })} disabled={disabled} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
