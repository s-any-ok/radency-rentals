import { FieldValues, Path, UseFormSetError } from 'react-hook-form';

/**
 * Puts server validation errors on the fields they belong to.
 * Returns the messages that didn't match a known field (shown as a form-level error).
 */
export const applyServerErrors = <T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors: Record<string, string>,
  knownFields: readonly string[],
): string[] => {
  const unmatched: string[] = [];

  for (const [path, message] of Object.entries(fieldErrors)) {
    const matches = knownFields.some((field) => path === field || path.startsWith(`${field}.`));
    if (matches) {
      setError(path as Path<T>, { type: 'server', message });
    } else {
      unmatched.push(message);
    }
  }

  return unmatched;
};
