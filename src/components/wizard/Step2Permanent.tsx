import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { NumericField } from '@/components/form/NumericField';
import type { DraftValues } from '@/hooks/useDraftSubmission';

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
  associations: AssociationEntry[];
  onAddAssoc: (a: AssociationEntry) => void;
  onUpdateAssoc: (idx: number, patch: Partial<AssociationEntry>) => void;
  onRemoveAssoc: (idx: number) => void;
  disabled?: boolean;
}

const DOMAINS_FR = ['Éducatif', 'Culturel', 'Sportif', 'Social', 'Environnemental', 'Autre'];
const DOMAINS_AR = ['تربوي', 'ثقافي', 'رياضي', 'اجتماعي', 'بيئي', 'أخرى'];

export const Step2Permanent = ({
  values, onUpdate, associations, onAddAssoc, onUpdateAssoc, onRemoveAssoc, disabled,
}: Props) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const domains = isAr ? DOMAINS_AR : DOMAINS_FR;

  return (
    <div className="space-y-5">
      {/* Compteurs */}
      <Card className="p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold">{isAr ? 'الأنشطة الدائمة' : 'Activités permanentes'}</h2>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'الجمعيات، الاتفاقيات، النوادي والمستفيدون' : 'Associations, conventions, clubs et bénéficiaires'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumericField
            label={isAr ? 'عدد الجمعيات' : 'Nombre d’associations'}
            value={Number(values.perm_associations ?? 0)}
            onChange={v => onUpdate({ perm_associations: v })}
            disabled={disabled}
          />
          <NumericField
            label={isAr ? 'عدد الاتفاقيات' : 'Nombre de conventions'}
            value={Number(values.perm_conventions ?? 0)}
            onChange={v => onUpdate({ perm_conventions: v })}
            disabled={disabled}
          />
          <NumericField
            label={isAr ? 'النوادي النشطة' : 'Clubs actifs'}
            value={Number(values.perm_clubs ?? 0)}
            onChange={v => onUpdate({ perm_clubs: v })}
            disabled={disabled}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">{isAr ? 'المشاركون' : 'Participants'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <NumericField
              label={isAr ? 'تربوي' : 'Éducatif'}
              value={Number(values.perm_educative ?? 0)}
              onChange={v => onUpdate({ perm_educative: v })}
              disabled={disabled}
            />
            <NumericField
              label={isAr ? 'ثقافي' : 'Culturel'}
              value={Number(values.perm_cultural ?? 0)}
              onChange={v => onUpdate({ perm_cultural: v })}
              disabled={disabled}
            />
            <NumericField
              label={isAr ? 'رياضي' : 'Sportif'}
              value={Number(values.perm_sportive ?? 0)}
              onChange={v => onUpdate({ perm_sportive: v })}
              disabled={disabled}
            />
            <NumericField
              label={isAr ? 'تعزيز القدرات' : 'Renforcement capacités'}
              value={Number(values.perm_capacity ?? 0)}
              onChange={v => onUpdate({ perm_capacity: v })}
              disabled={disabled}
            />
          </div>
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
            placeholder={isAr ? 'ملاحظات حول الأنشطة الدائمة…' : 'Notes sur les activités permanentes…'}
          />
        </div>
      </Card>

      {/* Associations entrantes / sortantes */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-lg font-bold">
              {isAr ? 'الجمعيات (واردة / مغادرة)' : 'Associations (entrantes / sortantes)'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isAr ? 'سجّل كل حركة جمعية خلال الفترة' : 'Enregistrez chaque mouvement d’association sur la période'}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => onAddAssoc({
              name: '', domain: '', movement_type: 'entrante', movement_date: '', motif: '',
            })}
            disabled={disabled}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {isAr ? 'إضافة' : 'Ajouter'}
          </Button>
        </div>

        {associations.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
            {isAr ? 'لا توجد جمعيات مسجلة بعد' : 'Aucune association enregistrée'}
          </div>
        ) : (
          <div className="space-y-3">
            {associations.map((a, idx) => (
              <div
                key={a.id ?? idx}
                className="border border-border rounded-lg p-4 bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    {a.movement_type === 'entrante' ? (
                      <span className="inline-flex items-center gap-1 text-success">
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                        {isAr ? 'واردة' : 'Entrante'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warning">
                        <ArrowUpFromLine className="h-3.5 w-3.5" />
                        {isAr ? 'مغادرة' : 'Sortante'}
                      </span>
                    )}
                    <span className="text-muted-foreground">#{idx + 1}</span>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => onRemoveAssoc(idx)}
                    disabled={disabled}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">{isAr ? 'الاسم' : 'Nom'}</Label>
                    <Input
                      value={a.name}
                      onChange={e => onUpdateAssoc(idx, { name: e.target.value.slice(0, 200) })}
                      disabled={disabled}
                      maxLength={200}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">{isAr ? 'المجال' : 'Domaine'}</Label>
                    <Select
                      value={a.domain || undefined}
                      onValueChange={v => onUpdateAssoc(idx, { domain: v })}
                      disabled={disabled}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={isAr ? 'اختر' : 'Choisir'} />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">{isAr ? 'النوع' : 'Type'}</Label>
                    <Select
                      value={a.movement_type}
                      onValueChange={v => onUpdateAssoc(idx, { movement_type: v as 'entrante' | 'sortante' })}
                      disabled={disabled}
                    >
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrante">{isAr ? 'واردة' : 'Entrante'}</SelectItem>
                        <SelectItem value="sortante">{isAr ? 'مغادرة' : 'Sortante'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">{isAr ? 'التاريخ' : 'Date'}</Label>
                    <Input
                      type="date"
                      value={a.movement_date}
                      onChange={e => onUpdateAssoc(idx, { movement_date: e.target.value })}
                      disabled={disabled}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">{isAr ? 'السبب' : 'Motif'}</Label>
                    <Input
                      value={a.motif}
                      onChange={e => onUpdateAssoc(idx, { motif: e.target.value.slice(0, 300) })}
                      disabled={disabled}
                      maxLength={300}
                      className="h-9"
                    />
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
