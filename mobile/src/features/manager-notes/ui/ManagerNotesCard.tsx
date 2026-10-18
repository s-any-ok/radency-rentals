import { View } from 'react-native';

import { formatDateTime } from 'src/shared/lib';
import { Button, Card, Text, TextField } from 'src/shared/ui';

import { useManagerNoteEditor } from '../model/useManagerNoteEditor';

type Props = { applicationId: string };

/** Internal notes, visible and editable only by property managers. */
export const ManagerNotesCard = ({ applicationId }: Props) => {
  const { note, text, setText, isDirty, save, saving, error } = useManagerNoteEditor(applicationId);

  return (
    <Card>
      <Text variant="heading">Internal notes</Text>
      <Text
        variant="caption"
        className="mb-3"
      >
        Only property managers can see these notes.
        {note?.updatedBy
          ? ` Last edited by ${note.updatedBy}, ${formatDateTime(note.updatedAt)}.`
          : ''}
      </Text>
      <TextField
        label="Notes"
        value={text}
        onChangeText={setText}
        multiline
        textAlignVertical="top"
        error={error ?? undefined}
        placeholder="E.g. called the previous landlord on Monday…"
      />
      <View className="items-end">
        <Button
          title="Save notes"
          size="sm"
          disabled={!isDirty}
          loading={saving}
          onPress={save}
        />
      </View>
    </Card>
  );
};
