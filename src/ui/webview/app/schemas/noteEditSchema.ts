import { z } from 'zod';

export function buildNoteEditSchema(
  priorityNames: string[],
  types: string[],
  scopes: string[],
  statuses: string[]
) {
  return z.object({
    content: z.string().min(1, 'Content is required'),
    priority: z.string().refine((v) => priorityNames.includes(v), { message: 'Invalid priority' }),
    type: z.string().refine((v) => types.includes(v), { message: 'Invalid type' }),
    scope: z.string().refine((v) => scopes.includes(v), { message: 'Invalid scope' }),
    status: z.string().refine((v) => statuses.includes(v), { message: 'Invalid status' }),
  });
}

export type NoteEditFormValues = z.infer<ReturnType<typeof buildNoteEditSchema>>;
