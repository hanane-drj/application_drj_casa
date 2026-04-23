import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SUBMISSION_NUMERIC_FIELDS, type SubmissionNumericField } from '@/lib/excelTemplate';
import { computeCompleteness, computeGlobalScore } from '@/lib/formSchema';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface DraftValues extends Partial<Record<SubmissionNumericField, number>> {
  comments?: string | null;
  director_name?: string | null;
  report_date?: string | null;
  period?: 'annuelle' | 'trimestrielle';
}

interface UseDraftOpts {
  prefectureId: string;
  year: number;
  userId: string;
  /** ms entre dernière saisie et auto-save. */
  debounceMs?: number;
}

/**
 * Charge / met à jour la soumission brouillon de la préfecture.
 * Auto-save debounced + bouton manuel via saveNow().
 */
export const useDraftSubmission = ({ prefectureId, year, userId, debounceMs = 2000 }: UseDraftOpts) => {
  const [values, setValues] = useState<DraftValues>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'brouillon' | 'soumise' | 'validee'>('brouillon');
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Chargement initial
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('submissions')
      .select('*')
      .eq('prefecture_id', prefectureId)
      .eq('year', year)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data) {
          setSubmissionId(data.id);
          setStatus(data.status);
          const init: DraftValues = { comments: data.comments ?? '' };
          SUBMISSION_NUMERIC_FIELDS.forEach(f => {
            init[f] = Number((data as any)[f] ?? 0);
          });
          setValues(init);
          if (data.updated_at) setLastSavedAt(new Date(data.updated_at));
        } else {
          // Brouillon vierge
          const init: DraftValues = { comments: '' };
          SUBMISSION_NUMERIC_FIELDS.forEach(f => {
            init[f] = 0;
          });
          setValues(init);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [prefectureId, year]);

  const persist = useCallback(async (next: DraftValues): Promise<boolean> => {
    setSaveState('saving');
    setErrorMsg(null);
    const completeness_pct = computeCompleteness(next);
    const global_score = computeGlobalScore(next);
    const numericPayload = Object.fromEntries(
      SUBMISSION_NUMERIC_FIELDS.map(f => [f, Math.round(Number(next[f] ?? 0))]),
    );
    const payload = {
      prefecture_id: prefectureId,
      year,
      status: status === 'validee' ? 'validee' : status,
      comments: (next.comments ?? '').toString().slice(0, 5000) || null,
      submitted_by: userId,
      completeness_pct,
      global_score,
      ...(next.director_name !== undefined ? { director_name: next.director_name } : {}),
      ...(next.report_date !== undefined ? { report_date: next.report_date } : {}),
      ...(next.period !== undefined ? { period: next.period } : {}),
      ...numericPayload,
    } as any;

    const op = submissionId
      ? supabase.from('submissions').update(payload).eq('id', submissionId).select('id, updated_at').maybeSingle()
      : supabase.from('submissions').insert(payload).select('id, updated_at').maybeSingle();

    const { data, error } = await op;
    if (error) {
      setSaveState('error');
      setErrorMsg(error.message);
      return false;
    }
    if (data?.id) setSubmissionId(data.id);
    if (data?.updated_at) setLastSavedAt(new Date(data.updated_at));
    setSaveState('saved');
    dirtyRef.current = false;
    // Reset to idle après 2s pour que l'indicateur ne reste pas figé
    setTimeout(() => setSaveState(s => (s === 'saved' ? 'idle' : s)), 2500);
    return true;
  }, [prefectureId, year, status, userId, submissionId]);

  const update = useCallback((patch: DraftValues) => {
    setValues(prev => {
      const next = { ...prev, ...patch };
      dirtyRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (dirtyRef.current) persist(next);
      }, debounceMs);
      return next;
    });
  }, [persist, debounceMs]);

  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    return persist(values);
  }, [persist, values]);

  const submit = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveState('saving');
    const completeness_pct = computeCompleteness(values);
    const global_score = computeGlobalScore(values);
    const numericPayload = Object.fromEntries(
      SUBMISSION_NUMERIC_FIELDS.map(f => [f, Math.round(Number(values[f] ?? 0))]),
    );
    const payload = {
      prefecture_id: prefectureId,
      year,
      status: 'soumise' as const,
      comments: (values.comments ?? '').toString().slice(0, 5000) || null,
      submitted_by: userId,
      submitted_at: new Date().toISOString(),
      completeness_pct,
      global_score,
      ...numericPayload,
    };
    const op = submissionId
      ? supabase.from('submissions').update(payload as any).eq('id', submissionId).select('id, updated_at, submitted_at').maybeSingle()
      : supabase.from('submissions').insert(payload as any).select('id, updated_at, submitted_at').maybeSingle();
    const { data, error } = await op;
    if (error) {
      setSaveState('error');
      setErrorMsg(error.message);
      return false;
    }
    if (data?.id) setSubmissionId(data.id);
    setStatus('soumise');
    if (data?.updated_at) setLastSavedAt(new Date(data.updated_at));
    setSaveState('saved');
    return true;
  }, [values, prefectureId, year, userId, submissionId]);

  // Save on unmount si dirty
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return {
    values,
    update,
    saveNow,
    submit,
    loading,
    saveState,
    lastSavedAt,
    errorMsg,
    status,
    submissionId,
    completeness: computeCompleteness(values),
    globalScore: computeGlobalScore(values),
  };
};
