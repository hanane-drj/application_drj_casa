import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Tent, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { NumericField } from '@/components/form/NumericField';

// --- Types kept compatible with the existing Saisie wiring -----------------
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

// Local-only structured fields for the new Camping form. Persisted to draft
// where columns exist (no backend changes); the rest is in-memory only.
interface AssocCounts {
  locales: number;
  nationales: number;
  regionales: number;
  multisuccursales: number;
  action_directe: number;
}

interface MovementEntry {
  id: string;
  name: string;
  movement_type: 'entrante' | 'sortante';
  date: string;
}

interface Participants {
  urban: number;
  rural: number;
  girls: number;
  boys: number;
  immigrant_children: number;
  special_needs: number;
}

interface Encadrement {
  camp_type: string;
  training_level: string;
  monitors_girls: number;
  monitors_boys: number;
}

interface TrainingEntry {
  id: string;
  stage_number: string;
  center: string;
  beneficiaries_girls: number;
  beneficiaries_boys: number;
  trainers_girls: number;
  trainers_boys: number;
}

interface Props {
  camps: CampEntry[];
  onAddCamp: (c: CampEntry) => void;
  onUpdateCamp: (idx: number, patch: Partial<CampEntry>) => void;
  onRemoveCamp: (idx: number) => void;
  disabled?: boolean;
}

const TRAINING_LEVEL_FR = ['Initiation', 'Approfondissement', 'Spécialisation'];
const TRAINING_LEVEL_AR = ['تمهيدي', 'تعميق', 'تخصص'];
const CAMP_TYPES_FR = ['Été', 'Hiver', 'Printemps', 'Spécialisé', 'International', 'Autre'];
const CAMP_TYPES_AR = ['صيفي', 'شتوي', 'ربيعي', 'متخصص', 'دولي', 'أخرى'];

export const Step5Camping = ({ camps, onAddCamp, onUpdateCamp, onRemoveCamp, disabled }: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [assocs, setAssocs] = useState<AssocCounts>({
    locales: 0, nationales: 0, regionales: 0, multisuccursales: 0, action_directe: 0,
  });
  const [movements, setMovements] = useState<MovementEntry[]>([]);
  const [participants, setParticipants] = useState<Participants>({
    urban: 0, rural: 0, girls: 0, boys: 0, immigrant_children: 0, special_needs: 0,
  });
  const [encadrement, setEncadrement] = useState<Encadrement>({
    camp_type: '', training_level: '', monitors_girls: 0, monitors_boys: 0,
  });
  const [trainings, setTrainings] = useState<TrainingEntry[]>([]);

  const trainingLevels = isAr ? TRAINING_LEVEL_AR : TRAINING_LEVEL_FR;
  const campTypes = isAr ? CAMP_TYPES_AR : CAMP_TYPES_FR;

  const addMovement = () => setMovements(p => [...p, {
    id: crypto.randomUUID(), name: '', movement_type: 'entrante', date: '',
  }]);
  const updMovement = (idx: number, patch: Partial<MovementEntry>) =>
    setMovements(p => p.map((m, i) => i === idx ? { ...m, ...patch } : m));
  const rmMovement = (idx: number) => setMovements(p => p.filter((_, i) => i !== idx));

  const addTraining = () => setTrainings(p => [...p, {
    id: crypto.randomUUID(), stage_number: '', center: '',
    beneficiaries_girls: 0, beneficiaries_boys: 0,
    trainers_girls: 0, trainers_boys: 0,
  }]);
  const updTraining = (idx: number, patch: Partial<TrainingEntry>) =>
    setTrainings(p => p.map((m, i) => i === idx ? { ...m, ...patch } : m));
  const rmTraining = (idx: number) => setTrainings(p => p.filter((_, i) => i !== idx));

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Tent className="h-5 w-5 text-primary" />
            {isAr ? 'البرنامج الوطني للتخييم' : 'Programme National de Camping'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'الجمعيات، المشاركون، التأطير والتكوينات' : 'Associations, participants, encadrement et formations'}
          </p>
        </div>

        {/* A. Associations */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">
            {isAr ? 'أ. الجمعيات' : 'A. Associations'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <NumericField label={isAr ? 'محلية' : 'Locales'} value={assocs.locales}
              onChange={v => setAssocs({ ...assocs, locales: v })} disabled={disabled} />
            <NumericField label={isAr ? 'وطنية' : 'Nationales'} value={assocs.nationales}
              onChange={v => setAssocs({ ...assocs, nationales: v })} disabled={disabled} />
            <NumericField label={isAr ? 'جهوية' : 'Régionales'} value={assocs.regionales}
              onChange={v => setAssocs({ ...assocs, regionales: v })} disabled={disabled} />
            <NumericField label={isAr ? 'متعددة الفروع' : 'Multisuccursales'} value={assocs.multisuccursales}
              onChange={v => setAssocs({ ...assocs, multisuccursales: v })} disabled={disabled} />
            <NumericField label={isAr ? 'فعل مباشر' : 'Action directe'} value={assocs.action_directe}
              onChange={v => setAssocs({ ...assocs, action_directe: v })} disabled={disabled} />
          </div>

          {/* Associations entrantes / sortantes (moved here from Permanentes) */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h4 className="text-sm font-semibold">
                {isAr ? 'الجمعيات (واردة / مغادرة)' : 'Associations (entrantes / sortantes)'}
              </h4>
              <Button type="button" size="sm" variant="outline"
                onClick={addMovement} disabled={disabled} className="gap-1.5">
                <Plus className="h-4 w-4" />
                {isAr ? 'إضافة' : 'Ajouter'}
              </Button>
            </div>
            {movements.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
                {isAr ? 'لا توجد حركات مسجلة' : 'Aucun mouvement enregistré'}
              </div>
            ) : (
              <div className="space-y-2">
                {movements.map((m, idx) => (
                  <div key={m.id} className="border border-border rounded-lg p-3 bg-muted/20 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                    <div className="sm:col-span-5 space-y-1.5">
                      <Label className="text-xs">{isAr ? 'الاسم' : 'Nom'}</Label>
                      <Input value={m.name} className="h-9" disabled={disabled}
                        onChange={e => updMovement(idx, { name: e.target.value.slice(0, 200) })} />
                    </div>
                    <div className="sm:col-span-3 space-y-1.5">
                      <Label className="text-xs">{isAr ? 'النوع' : 'Type'}</Label>
                      <Select value={m.movement_type}
                        onValueChange={v => updMovement(idx, { movement_type: v as 'entrante' | 'sortante' })}
                        disabled={disabled}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrante">
                            <span className="inline-flex items-center gap-1.5">
                              <ArrowDownToLine className="h-3.5 w-3.5" />
                              {isAr ? 'واردة' : 'Entrante'}
                            </span>
                          </SelectItem>
                          <SelectItem value="sortante">
                            <span className="inline-flex items-center gap-1.5">
                              <ArrowUpFromLine className="h-3.5 w-3.5" />
                              {isAr ? 'مغادرة' : 'Sortante'}
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-3 space-y-1.5">
                      <Label className="text-xs">{isAr ? 'التاريخ' : 'Date'}</Label>
                      <Input type="date" value={m.date} className="h-9" disabled={disabled}
                        onChange={e => updMovement(idx, { date: e.target.value })} />
                    </div>
                    <div className="sm:col-span-1">
                      <Button type="button" size="icon" variant="ghost"
                        onClick={() => rmMovement(idx)} disabled={disabled}
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* B. Participants */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">
            {isAr ? 'ب. المشاركون' : 'B. Participants'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <NumericField label={isAr ? 'حضري' : 'Urbain'} value={participants.urban}
              onChange={v => setParticipants({ ...participants, urban: v })} disabled={disabled} />
            <NumericField label={isAr ? 'قروي' : 'Rural'} value={participants.rural}
              onChange={v => setParticipants({ ...participants, rural: v })} disabled={disabled} />
            <NumericField label={isAr ? 'فتيات' : 'Filles'} value={participants.girls}
              onChange={v => setParticipants({ ...participants, girls: v })} disabled={disabled} />
            <NumericField label={isAr ? 'فتيان' : 'Garçons'} value={participants.boys}
              onChange={v => setParticipants({ ...participants, boys: v })} disabled={disabled} />
            <NumericField label={isAr ? 'أبناء المهاجرين' : "Enfants d'immigrés"}
              value={participants.immigrant_children}
              onChange={v => setParticipants({ ...participants, immigrant_children: v })} disabled={disabled} />
            <NumericField label={isAr ? 'احتياجات خاصة' : 'Besoins spécifiques'}
              value={participants.special_needs}
              onChange={v => setParticipants({ ...participants, special_needs: v })} disabled={disabled} />
          </div>
        </section>

        {/* C. Encadrement */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">
            {isAr ? 'ج. التأطير' : 'C. Encadrement'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? 'نوع المخيم' : 'Type de camp'}</Label>
              <Select value={encadrement.camp_type || undefined}
                onValueChange={v => setEncadrement({ ...encadrement, camp_type: v })}
                disabled={disabled}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={isAr ? 'اختر' : 'Choisir'} />
                </SelectTrigger>
                <SelectContent>
                  {campTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? 'مستوى التكوين' : 'Niveau de formation'}</Label>
              <Select value={encadrement.training_level || undefined}
                onValueChange={v => setEncadrement({ ...encadrement, training_level: v })}
                disabled={disabled}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={isAr ? 'اختر' : 'Choisir'} />
                </SelectTrigger>
                <SelectContent>
                  {trainingLevels.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <NumericField label={isAr ? 'مؤطرات (فتيات)' : 'Monitrices (Filles)'}
              value={encadrement.monitors_girls}
              onChange={v => setEncadrement({ ...encadrement, monitors_girls: v })} disabled={disabled} />
            <NumericField label={isAr ? 'مؤطرون (فتيان)' : 'Moniteurs (Garçons)'}
              value={encadrement.monitors_boys}
              onChange={v => setEncadrement({ ...encadrement, monitors_boys: v })} disabled={disabled} />
          </div>
        </section>

        {/* D. Trainings */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-sm font-semibold">
              {isAr ? 'د. التكوينات المنجزة' : 'D. Formations réalisées'}
            </h3>
            <Button type="button" size="sm" variant="outline"
              onClick={addTraining} disabled={disabled} className="gap-1.5">
              <Plus className="h-4 w-4" />
              {isAr ? 'إضافة تكوين' : 'Ajouter une formation'}
            </Button>
          </div>
          {trainings.length === 0 ? (
            <div className="text-center py-4 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
              {isAr ? 'لا توجد تكوينات' : 'Aucune formation enregistrée'}
            </div>
          ) : (
            <div className="space-y-3">
              {trainings.map((tr, idx) => (
                <div key={tr.id} className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
                    <Button type="button" size="icon" variant="ghost"
                      onClick={() => rmTraining(idx)} disabled={disabled}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{isAr ? 'رقم الدورة' : 'Numéro de stage'}</Label>
                      <Input value={tr.stage_number} className="h-9" disabled={disabled}
                        onChange={e => updTraining(idx, { stage_number: e.target.value.slice(0, 50) })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{isAr ? 'المركز' : 'Centre'}</Label>
                      <Input value={tr.center} className="h-9" disabled={disabled}
                        onChange={e => updTraining(idx, { center: e.target.value.slice(0, 200) })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <NumericField label={isAr ? 'مستفيدات (فتيات)' : 'Bénéficiaires (Filles)'}
                      value={tr.beneficiaries_girls}
                      onChange={v => updTraining(idx, { beneficiaries_girls: v })} disabled={disabled} />
                    <NumericField label={isAr ? 'مستفيدون (فتيان)' : 'Bénéficiaires (Garçons)'}
                      value={tr.beneficiaries_boys}
                      onChange={v => updTraining(idx, { beneficiaries_boys: v })} disabled={disabled} />
                    <NumericField label={isAr ? 'مكوّنات (فتيات)' : 'Formatrices (Filles)'}
                      value={tr.trainers_girls}
                      onChange={v => updTraining(idx, { trainers_girls: v })} disabled={disabled} />
                    <NumericField label={isAr ? 'مكوّنون (فتيان)' : 'Formateurs (Garçons)'}
                      value={tr.trainers_boys}
                      onChange={v => updTraining(idx, { trainers_boys: v })} disabled={disabled} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </Card>

      {/* Camps list (kept — stored in backend) */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-bold">
              {isAr ? 'قائمة المخيمات' : 'Liste des camps'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isAr ? 'أضف كل مخيّم على حدة' : 'Ajoutez chaque camp individuellement'}
            </p>
          </div>
          <Button type="button" size="sm" onClick={() => onAddCamp({
            name: '', camp_type: '', girls: 0, boys: 0, rural: 0, urban: 0,
            facilitators: 0, facilitators_trained: 0,
          })} disabled={disabled} className="gap-1.5">
            <Plus className="h-4 w-4" />
            {isAr ? 'إضافة مخيّم' : 'Ajouter un camp'}
          </Button>
        </div>

        {camps.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
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
                    <Button type="button" size="icon" variant="ghost"
                      onClick={() => onRemoveCamp(idx)} disabled={disabled}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{isAr ? 'اسم المخيم' : 'Nom du camp'}</Label>
                      <Input value={c.name} maxLength={200} className="h-9" disabled={disabled}
                        onChange={e => onUpdateCamp(idx, { name: e.target.value.slice(0, 200) })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{isAr ? 'نوع المخيم' : 'Type de camp'}</Label>
                      <Select value={c.camp_type || undefined}
                        onValueChange={v => onUpdateCamp(idx, { camp_type: v })}
                        disabled={disabled}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={isAr ? 'اختر' : 'Choisir'} />
                        </SelectTrigger>
                        <SelectContent>
                          {campTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <NumericField label={isAr ? 'فتيات' : 'Filles'} value={Number(c.girls) || 0}
                      onChange={v => onUpdateCamp(idx, { girls: v })} disabled={disabled} />
                    <NumericField label={isAr ? 'فتيان' : 'Garçons'} value={Number(c.boys) || 0}
                      onChange={v => onUpdateCamp(idx, { boys: v })} disabled={disabled} />
                    <NumericField label={isAr ? 'المجموع' : 'Total'} value={total} computed disabled={disabled} />
                    <NumericField label={isAr ? 'قروي' : 'Rural'} value={Number(c.rural) || 0}
                      onChange={v => onUpdateCamp(idx, { rural: v })} disabled={disabled} />
                    <NumericField label={isAr ? 'حضري' : 'Urbain'} value={Number(c.urban) || 0}
                      onChange={v => onUpdateCamp(idx, { urban: v })} disabled={disabled} />
                    <NumericField label={isAr ? 'المؤطرون' : 'Encadrants'} value={Number(c.facilitators) || 0}
                      onChange={v => onUpdateCamp(idx, { facilitators: v })} disabled={disabled} />
                    <NumericField label={isAr ? 'المؤطرون المكوّنون' : 'Encadrants formés'}
                      value={Number(c.facilitators_trained) || 0}
                      onChange={v => onUpdateCamp(idx, { facilitators_trained: v })} disabled={disabled} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
