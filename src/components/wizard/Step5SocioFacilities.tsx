import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Landmark, Building2 } from 'lucide-react';
import { NumericField } from '@/components/form/NumericField';
import type { DraftValues } from '@/hooks/useDraftSubmission';

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
  values: DraftValues;
  onUpdate: (patch: DraftValues) => void;
  socioeco: SocioEcoEntry[];
  onAddSocio: (s: SocioEcoEntry) => void;
  onUpdateSocio: (idx: number, patch: Partial<SocioEcoEntry>) => void;
  onRemoveSocio: (idx: number) => void;
  disabled?: boolean;
}

const ACTIVITY_TYPES_FR = ['Formation', 'Atelier', 'Stage', 'Insertion', 'Sensibilisation', 'Autre'];
const ACTIVITY_TYPES_AR = ['تكوين', 'ورشة', 'تدريب', 'إدماج', 'تحسيس', 'أخرى'];

export const Step5SocioFacilities = ({
  values, onUpdate, socioeco, onAddSocio, onUpdateSocio, onRemoveSocio, disabled,
}: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const types = isAr ? ACTIVITY_TYPES_AR : ACTIVITY_TYPES_FR;

  return (
    <div className="space-y-5">
      {/* SOCIO-ECO */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              {isAr ? 'الأنشطة السوسيو-اقتصادية' : 'Activités socio-économiques'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? 'أضف كل نشاط على حدة' : 'Ajoutez chaque activité individuellement'}
            </p>
          </div>
          <Button
            type="button" size="sm"
            onClick={() => onAddSocio({
              subject: '', activity_type: '', partner: '', duration: '',
              men: 0, women: 0, urban_pct: 0, rural_pct: 0,
            })}
            disabled={disabled} className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {isAr ? 'إضافة' : 'Ajouter'}
          </Button>
        </div>

        {socioeco.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
            {isAr ? 'لا توجد أنشطة' : 'Aucune activité enregistrée'}
          </div>
        ) : (
          <div className="space-y-3">
            {socioeco.map((s, idx) => (
              <div key={s.id ?? idx} className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
                  <Button
                    type="button" size="icon" variant="ghost"
                    onClick={() => onRemoveSocio(idx)} disabled={disabled}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">{isAr ? 'الموضوع' : 'Sujet'}</Label>
                    <Input
                      value={s.subject} maxLength={200}
                      onChange={e => onUpdateSocio(idx, { subject: e.target.value.slice(0, 200) })}
                      disabled={disabled} className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{isAr ? 'نوع النشاط' : 'Type d’activité'}</Label>
                    <Select
                      value={s.activity_type || undefined}
                      onValueChange={v => onUpdateSocio(idx, { activity_type: v })}
                      disabled={disabled}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={isAr ? 'اختر' : 'Choisir'} />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{isAr ? 'الشريك' : 'Partenaire'}</Label>
                    <Input
                      value={s.partner} maxLength={200}
                      onChange={e => onUpdateSocio(idx, { partner: e.target.value.slice(0, 200) })}
                      disabled={disabled} className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">{isAr ? 'المدة' : 'Durée'}</Label>
                    <Input
                      value={s.duration} maxLength={100}
                      placeholder={isAr ? 'مثال: 3 أيام' : 'Ex: 3 jours'}
                      onChange={e => onUpdateSocio(idx, { duration: e.target.value.slice(0, 100) })}
                      disabled={disabled} className="h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <NumericField
                    label={isAr ? 'رجال' : 'Hommes'}
                    value={Number(s.men) || 0}
                    onChange={v => onUpdateSocio(idx, { men: v })}
                    disabled={disabled}
                  />
                  <NumericField
                    label={isAr ? 'نساء' : 'Femmes'}
                    value={Number(s.women) || 0}
                    onChange={v => onUpdateSocio(idx, { women: v })}
                    disabled={disabled}
                  />
                  <NumericField
                    label={isAr ? '٪ حضري' : '% urbain'}
                    value={Number(s.urban_pct) || 0}
                    onChange={v => onUpdateSocio(idx, { urban_pct: v })}
                    disabled={disabled}
                  />
                  <NumericField
                    label={isAr ? '٪ قروي' : '% rural'}
                    value={Number(s.rural_pct) || 0}
                    onChange={v => onUpdateSocio(idx, { rural_pct: v })}
                    disabled={disabled}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* FACILITIES */}
      <Card className="p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {isAr ? 'وضعية المؤسسات' : 'Situation des établissements'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'الحالة العامة للبنيات التحتية' : 'État général des infrastructures'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <NumericField
            label={isAr ? 'محدّثة / فعّالة' : 'Mises à jour / fonctionnelles'}
            value={Number(values.inst_updated ?? 0)}
            onChange={v => onUpdate({ inst_updated: v })}
            disabled={disabled}
          />
          <NumericField
            label={isAr ? 'قيد الإصلاح' : 'En cours de réhabilitation'}
            value={Number(values.inst_in_progress ?? 0)}
            onChange={v => onUpdate({ inst_in_progress: v })}
            disabled={disabled}
          />
          <NumericField
            label={isAr ? 'في نزاع' : 'En litige'}
            value={Number(values.inst_dispute ?? 0)}
            onChange={v => onUpdate({ inst_dispute: v })}
            disabled={disabled}
          />
          <NumericField
            label={isAr ? 'تحتاج إلى إصلاح' : 'Besoins de réhabilitation'}
            value={Number(values.inst_rehab_needs ?? 0)}
            onChange={v => onUpdate({ inst_rehab_needs: v })}
            disabled={disabled}
          />
        </div>
      </Card>
    </div>
  );
};
