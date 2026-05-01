import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Calendar, Layers, ArrowRight, ArrowLeft, FileText, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PeriodType = 'annuel' | 'trimestriel';
export type Quarter = 'T1' | 'T2' | 'T3' | 'T4';
export type Domain = 'jeunesse' | 'femme' | 'enfants' | 'creche';

export interface ReportSelection {
  year: number;
  type: PeriodType;
  quarter?: Quarter;
  domain: Domain;
}

interface Props {
  initial: ReportSelection;
  onComplete: (sel: ReportSelection) => void;
}

const DOMAIN_FR: { v: Domain; l: string; available: boolean }[] = [
  { v: 'jeunesse', l: 'Jeunesse', available: true },
  { v: 'femme', l: 'Femme / Fille (à venir)', available: false },
  { v: 'enfants', l: 'Enfants (à venir)', available: false },
  { v: 'creche', l: 'Crèche (à venir)', available: false },
];
const DOMAIN_AR: { v: Domain; l: string; available: boolean }[] = [
  { v: 'jeunesse', l: 'الشباب', available: true },
  { v: 'femme', l: 'المرأة / الفتاة (قريباً)', available: false },
  { v: 'enfants', l: 'الأطفال (قريباً)', available: false },
  { v: 'creche', l: 'الحضانة (قريباً)', available: false },
];

export const PreFormSelection = ({ initial, onComplete }: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const domains = isAr ? DOMAIN_AR : DOMAIN_FR;

  const [stage, setStage] = useState<1 | 2>(1);
  const [sel, setSel] = useState<ReportSelection>(initial);

  const canNextFromStage1 =
    !!sel.year &&
    !!sel.type &&
    (sel.type === 'annuel' || !!sel.quarter);

  const stages = [
    { id: 1, label: isAr ? 'اختيار التقرير' : 'Choisir le rapport', icon: Calendar },
    { id: 2, label: isAr ? 'اختيار المجال' : 'Choisir le domaine', icon: Layers },
    { id: 3, label: isAr ? 'الاستمارة' : 'Formulaire', icon: FileText },
  ];

  return (
    <div className="space-y-5">
      {/* Stages indicator */}
      <Card className="p-4 sm:p-5">
        <ol className="flex items-center justify-between gap-2">
          {stages.map((s, idx) => {
            const Icon = s.icon;
            const active = s.id === stage;
            const done = s.id < stage;
            return (
              <li key={s.id} className="flex-1 flex items-center min-w-0">
                <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                  <div className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center border-2 transition-smooth flex-shrink-0',
                    done && 'bg-primary text-primary-foreground border-primary',
                    active && 'bg-primary-soft text-primary border-primary ring-4 ring-primary/15',
                    !done && !active && 'bg-card text-muted-foreground border-border',
                  )}>
                    {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={cn(
                    'text-[10px] sm:text-xs font-medium text-center leading-tight',
                    active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground',
                  )}>
                    {s.label}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <div className={cn(
                    'h-0.5 flex-1 mx-1 sm:mx-2 transition-smooth',
                    s.id < stage ? 'bg-primary' : 'bg-border',
                  )} />
                )}
              </li>
            );
          })}
        </ol>
      </Card>

      {/* STAGE 1: Report */}
      {stage === 1 && (
        <Card className="p-5 sm:p-7 space-y-5">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {isAr ? 'اختيار التقرير' : 'Choisir le rapport'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isAr ? 'حدد السنة والنوع' : 'Sélectionnez l\'année et le type de rapport'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{isAr ? 'السنة' : 'Année'}</Label>
              <Input
                type="number"
                min={2020}
                max={2099}
                value={sel.year}
                onChange={e => setSel(s => ({ ...s, year: Number(e.target.value) || s.year }))}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{isAr ? 'النوع' : 'Type'}</Label>
              <Select value={sel.type} onValueChange={(v: PeriodType) => setSel(s => ({ ...s, type: v, quarter: v === 'annuel' ? undefined : s.quarter }))}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annuel">{isAr ? 'سنوي' : 'Annuel'}</SelectItem>
                  <SelectItem value="trimestriel">{isAr ? 'فصلي' : 'Trimestriel'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sel.type === 'trimestriel' && (
              <div className="space-y-1.5 sm:col-span-2 animate-fade-in">
                <Label className="text-xs font-medium">{isAr ? 'الفصل' : 'Trimestre'}</Label>
                <Select value={sel.quarter} onValueChange={(v: Quarter) => setSel(s => ({ ...s, quarter: v }))}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={isAr ? 'اختر الفصل' : 'Choisir le trimestre'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T1">T1</SelectItem>
                    <SelectItem value="T2">T2</SelectItem>
                    <SelectItem value="T3">T3</SelectItem>
                    <SelectItem value="T4">T4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setStage(2)} disabled={!canNextFromStage1} className="gap-1.5">
              {isAr ? 'التالي' : 'Suivant'}
              {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </Card>
      )}

      {/* STAGE 2: Domain */}
      {stage === 2 && (
        <Card className="p-5 sm:p-7 space-y-5">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              {isAr ? 'اختيار المجال' : 'Choisir le domaine'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isAr ? 'اختر المجال المراد تعبئته' : 'Sélectionnez le domaine à renseigner'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {domains.map(d => {
              const selected = sel.domain === d.v;
              return (
                <button
                  key={d.v}
                  type="button"
                  disabled={!d.available}
                  onClick={() => d.available && setSel(s => ({ ...s, domain: d.v }))}
                  className={cn(
                    'rounded-xl border-2 p-4 text-start transition-smooth flex items-center justify-between gap-3',
                    selected && d.available && 'border-primary bg-primary-soft ring-4 ring-primary/15',
                    !selected && d.available && 'border-border hover:border-primary/50 bg-card',
                    !d.available && 'border-dashed border-border bg-muted/30 cursor-not-allowed opacity-60',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center',
                      selected && d.available ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}>
                      {d.available ? <Layers className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                    </div>
                    <span className="font-semibold text-sm">{d.l}</span>
                  </div>
                  {selected && d.available && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStage(1)} className="gap-1.5">
              {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              {isAr ? 'السابق' : 'Précédent'}
            </Button>
            <Button onClick={() => onComplete(sel)} className="gap-1.5">
              {isAr ? 'افتح الاستمارة' : 'Accéder au formulaire'}
              {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
