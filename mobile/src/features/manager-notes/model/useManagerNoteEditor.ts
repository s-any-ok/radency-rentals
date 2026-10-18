import { useCallback, useEffect, useState } from 'react';

import { useManagerNote, useUpdateManagerNote } from 'src/entities/application';
import { getErrorMessage } from 'src/shared/api';
import { createId, submitChange } from 'src/shared/lib';

export const useManagerNoteEditor = (applicationId: string) => {
  const { data: note, isLoading } = useManagerNote(applicationId, true);
  const updateNote = useUpdateManagerNote();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync the editor when the stored note changes (first load, refetch after save).
  useEffect(() => {
    if (note) setText(note.text);
  }, [note]);

  const isDirty = (note?.text ?? '') !== text;

  const save = useCallback(async () => {
    setError(null);
    setSaving(true);
    try {
      await submitChange(updateNote, {
        id: applicationId,
        text,
        version: note?.version ?? null,
        idempotencyKey: createId(),
        description: 'Update internal notes',
      });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }, [applicationId, note?.version, text, updateNote]);

  return { note, text, setText, isDirty, save, saving, error, isLoading };
};
