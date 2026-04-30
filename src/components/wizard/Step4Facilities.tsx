import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Building2 } from 'lucide-react';

export interface FacilityEntry {
  id: string;
  name: string;
  project_status: string;
  other_status: string;
  closure_status: string;
}

const PROJECT_STATUS_FR = [
  { v: 'nouvellement', l: 'Nouvellement créée' },
  { v: 'en_cours', l: 'En cours de réalisation' },
];
const PROJECT_STATUS_AR = [
  { v: 'nouvellement', l: 'حديثة الإنشاء' },
  { v: 'en_cours', l: 'قيد الإنجاز' },
];

const OTHER_STATUS_FR = [
  { v: 'conflit', l: 'Conflit juridique' },
  { v: 'mise_a_niveau', l: 'Mise à niveau' },
  { v: 'encadrement', l: 'Encadrement' },
  { v: 'equipement', l: 'Équipement' },
  { v: 'attente', l: "En attente d'inauguration" },
];
const OTHER_STATUS_AR = [
  { v: 'conflit', l: 'نزاع قانوني' },
  { v: 'mise_a_niveau', l: 'تأهيل' },
  { v: 'encadrement', l: 'تأطير' },
  { v: 'equipement', l: 'تجهيز' },
  { v: 'attente', l: 'في انتظار التدشين' },
];

interface Props {
  disabled?: boolean;
}

export const Step4Facilities = ({ disabled }: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [items, setItems] = useState<FacilityEntry[]>([]);

  const projectStatuses = isAr ? PROJECT_STATUS_AR : PROJECT_STATUS_FR;
  const otherStatuses = isAr ? OTHER_STATUS_AR : OTHER_STATUS_FR;

  const add = () => setItems(prev => [...prev, {
    id: crypto.randomUUID(),
    name: '',
    project_status: '',
    other_status: '',
    closure_status: '',
  }]);
  const update = (idx: number, patch: Partial<FacilityEntry>) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  const remove = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {isAr ? 'وضعية مؤسسات الشباب' : 'État des établissements de jeunesse'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'أضف كل مؤسسة على حدة' : 'Ajoutez chaque établissement'}
          </p>
        </div>
        <Button type="button" size="sm" onClick={add} disabled={disabled} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {isAr ? 'إضافة' : 'Ajouter'}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
          {isAr ? 'لا توجد مؤسسات مسجلة' : 'Aucun établissement enregistré'}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={it.id} className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
                <Button
                  type="button" size="icon" variant="ghost"
                  onClick={() => remove(idx)} disabled={disabled}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">{isAr ? 'اسم المؤسسة' : "Nom de l'établissement"}</Label>
                  <Input
                    value={it.name}
                    onChange={e => update(idx, { name: e.target.value.slice(0, 200) })}
                    disabled={disabled} className="h-9" maxLength={200}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">{isAr ? 'متابعة المشاريع' : 'Suivi des projets'}</Label>
                  <Select
                    value={it.project_status || undefined}
                    onValueChange={v => update(idx, { project_status: v })}
                    disabled={disabled}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={isAr ? 'اختر' : 'Choisir'} />
                    </SelectTrigger>
                    <SelectContent>
                      {projectStatuses.map(s => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">
                    {isAr ? 'حالة أخرى للمؤسسة' : "Autre statut de l'établissement"}
                  </Label>
                  <Select
                    value={it.other_status || undefined}
                    onValueChange={v => update(idx, { other_status: v })}
                    disabled={disabled}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={isAr ? 'اختر' : 'Choisir'} />
                    </SelectTrigger>
                    <SelectContent>
                      {otherStatuses.map(s => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">{isAr ? 'حالة الإغلاق' : 'Statut de fermeture'}</Label>
                  <Input
                    value={it.closure_status}
                    onChange={e => update(idx, { closure_status: e.target.value.slice(0, 300) })}
                    disabled={disabled} className="h-9" maxLength={300}
                    placeholder={isAr ? 'تفاصيل…' : 'Détails…'}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
