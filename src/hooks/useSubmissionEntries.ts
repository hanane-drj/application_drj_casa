import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Generic hook to manage a child table linked to a submission_id.
 * Loads rows on mount, exposes add/update/remove + persistAll().
 */
export function useSubmissionEntries<T extends { id?: string }>(
  table:
    | 'submission_associations'
    | 'submission_camps'
    | 'submission_festivals'
    | 'submission_socioeco'
    | 'submission_indicators',
  submissionId: string | null,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!submissionId) {
      setItems([]);
      return;
    }
    setLoading(true);
    supabase
      .from(table as any)
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setItems((data as T[]) ?? []);
        setLoading(false);
      });
  }, [table, submissionId]);

  const add = useCallback((draft: T) => {
    setItems(prev => [...prev, { ...draft, id: draft.id ?? `tmp-${Math.random().toString(36).slice(2)}` }]);
  }, []);

  const update = useCallback((idx: number, patch: Partial<T>) => {
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }, []);

  const remove = useCallback(async (idx: number) => {
    const target = items[idx];
    setItems(prev => prev.filter((_, i) => i !== idx));
    if (target?.id && !String(target.id).startsWith('tmp-') && submissionId) {
      await supabase.from(table as any).delete().eq('id', target.id);
    }
  }, [items, submissionId, table]);

  /** Persist: insert new (tmp- ids) and update existing. */
  const persistAll = useCallback(async (subId: string) => {
    if (!subId) return false;
    const toInsert = items
      .filter(it => !it.id || String(it.id).startsWith('tmp-'))
      .map(({ id, ...rest }) => ({ ...rest, submission_id: subId }));
    const toUpdate = items.filter(it => it.id && !String(it.id).startsWith('tmp-'));

    if (toInsert.length) {
      const { error } = await supabase.from(table as any).insert(toInsert as any);
      if (error) return false;
    }
    for (const row of toUpdate) {
      const { id, ...rest } = row as any;
      const { error } = await supabase.from(table as any).update(rest).eq('id', id);
      if (error) return false;
    }
    return true;
  }, [items, table]);

  return { items, setItems, add, update, remove, persistAll, loading };
}
