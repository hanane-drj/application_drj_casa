import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Tent, Trophy } from 'lucide-react';
import { NumericField } from '@/components/form/NumericField';

export interface CampEntry {
  id?: string;
  name: string;
  camp_type: string;
  girls: number;
  boys: number;
  rural: number;
  urban: number;
  facilitators: number;
  facilitators_trained: number;
}

export interface FestivalEntry {
  id?: string;
  name: string;
  participants: number;
  qualified: number;
}

interface Props {
  camps: CampEntry[];
  onAddCamp: (c: CampEntry) => void;
  onUpdateCamp: (idx: number, patch: Partial<CampEntry>) => void;
  onRemoveCamp: (idx: number) => void;

  festivals: FestivalEntry[];
  onAddFestival: (f: FestivalEntry) => void;
  onUpdateFestival: (idx: number, patch: Partial<FestivalEntry>) => void;
  onRemoveFestival: (idx: number) => void;

  disabled?: boolean;
}

const CAMP_TYPES_FR = ['Été', 'Hiver', 'Printemps', 'Spécialisé', 'International', 'Autre'];
const CAMP_TYPES_AR = ['صيفي', 'شتوي', 'ربيعي', 'متخصص', 'دولي', 'أخرى'];

export const Step4CampsFestivals = ({
  camps, onAddCamp, onUpdateCamp, onRemoveCamp,
  festivals, onAddFestival, onUpdateFestival, onRemoveFestival,
  disabled,
}: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const types = isAr ? CAMP_TYPES_AR : CAMP_TYPES_FR;

  return (
    <div className="space-y-5">
      {/* CAMPS */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Tent className="h-5 w-5 text-primary" />
              {isAr ? 'التخييم' : 'Camping'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? 'أضف كل مخيّم على حدة' : 'Ajoutez chaque camp individuellement'}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => onAddCamp({
              name: '', camp_type: '', girls: 0, boys: 0, rural: 0, urban: 0,
              facilitators: 0, facilitators_trained: 0,
            })}
            disabled={disabled}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {isAr ? 'إضافة مخيّم' : 'Ajouter un camp'}
          </Button>
        </div>

        {camps.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
            {isAr ? 'لا توجد مخيمات' : 'Aucun camp enregistré'}
          </div>
        ) : (
          <div className="space-y-3">
            {camps.map((c, idx) => {
              const total = (Number(c.girls) || 0) + (Number(c.boys) || 0);
              return (
                <div key={c.id ?? idx} className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
                    <Button
                      type="button" size="icon" variant="ghost"
                      onClick={() => onRemoveCamp(idx)} disabled={disabled}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{isAr ? 'اسم المخيم' : 'Nom du camp'}</Label>
                      <Input
                        value={c.name} maxLength={200}
                        onChange={e => onUpdateCamp(idx, { name: e.target.value.slice(0, 200) })}
                        disabled={disabled} className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{isAr ? 'نوع المخيم' : 'Type de camp'}</Label>
                      <Select
                        value={c.camp_type || undefined}
                        onValueChange={v => onUpdateCamp(idx, { camp_type: v })}
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
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <NumericField
                      label={isAr ? 'فتيات' : 'Filles'}
                      value={Number(c.girls) || 0}
                      onChange={v => onUpdateCamp(idx, { girls: v })}
                      disabled={disabled}
                    />
                    <NumericField
                      label={isAr ? 'فتيان' : 'Garçons'}
                      value={Number(c.boys) || 0}
                      onChange={v => onUpdateCamp(idx, { boys: v })}
                      disabled={disabled}
                    />
                    <NumericField
                      label={isAr ? 'المجموع' : 'Total'}
                      value={total}
                      computed
                      disabled={disabled}
                    />
                    <NumericField
                      label={isAr ? 'قروي' : 'Rural'}
                      value={Number(c.rural) || 0}
                      onChange={v => onUpdateCamp(idx, { rural: v })}
                      disabled={disabled}
                    />
                    <NumericField
                      label={isAr ? 'حضري' : 'Urbain'}
                      value={Number(c.urban) || 0}
                      onChange={v => onUpdateCamp(idx, { urban: v })}
                      disabled={disabled}
                    />
                    <NumericField
                      label={isAr ? 'المؤطرون' : 'Encadrants'}
                      value={Number(c.facilitators) || 0}
                      onChange={v => onUpdateCamp(idx, { facilitators: v })}
                      disabled={disabled}
                    />
                    <NumericField
                      label={isAr ? 'المؤطرون المكوّنون' : 'Encadrants formés'}
                      value={Number(c.facilitators_trained) || 0}
                      onChange={v => onUpdateCamp(idx, { facilitators_trained: v })}
                      disabled={disabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* FESTIVALS */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {isAr ? 'المهرجانات' : 'Festivals'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? 'أضف كل مهرجان على حدة' : 'Ajoutez chaque festival individuellement'}
            </p>
          </div>
          <Button
            type="button" size="sm"
            onClick={() => onAddFestival({ name: '', participants: 0, qualified: 0 })}
            disabled={disabled} className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {isAr ? 'إضافة مهرجان' : 'Ajouter un festival'}
          </Button>
        </div>

        {festivals.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
            {isAr ? 'لا توجد مهرجانات' : 'Aucun festival enregistré'}
          </div>
        ) : (
          <div className="space-y-3">
            {festivals.map((f, idx) => (
              <div key={f.id ?? idx} className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
                  <Button
                    type="button" size="icon" variant="ghost"
                    onClick={() => onRemoveFestival(idx)} disabled={disabled}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label className="text-xs">{isAr ? 'اسم المهرجان' : 'Nom du festival'}</Label>
                    <Input
                      value={f.name} maxLength={200}
                      onChange={e => onUpdateFestival(idx, { name: e.target.value.slice(0, 200) })}
                      disabled={disabled} className="h-9"
                    />
                  </div>
                  <NumericField
                    label={isAr ? 'عدد المشاركين' : 'Nombre de participants'}
                    value={Number(f.participants) || 0}
                    onChange={v => onUpdateFestival(idx, { participants: v })}
                    disabled={disabled}
                  />
                  <NumericField
                    label={isAr ? 'الشباب المؤهلون' : 'Jeunes qualifiés'}
                    value={Number(f.qualified) || 0}
                    onChange={v => onUpdateFestival(idx, { qualified: v })}
                    disabled={disabled}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
