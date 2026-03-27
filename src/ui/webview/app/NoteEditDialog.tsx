import React, { useEffect, useMemo, useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from './components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import { useVscodeApi } from './contexts/VscodeApiProvider';
import { useWebviewHostMessageHandler } from './contexts/WebviewHostMessageProvider';
import { webviewHostService } from './services/webviewHostService';
import { NoteEditForm } from './components/note-edit/NoteEditForm';
import { useNoteEditConfig } from './hooks/useNoteEditConfig';
import { buildNoteEditSchema, type NoteEditFormValues } from './schemas/noteEditSchema';

export type { NoteEditFormValues };

type NoteUpdatedMessage = {
  type: 'noteUpdated';
  success: boolean;
  error?: string;
};

export interface NoteEditDialogProps {
  note: {
    id: string;
    content: string;
    priority: string;
    type: string;
    scope: string;
    status: string;
  };
  onClose: () => void;
}

export function NoteEditDialog({ note, onClose }: NoteEditDialogProps): ReactElement {
  const { priorityNames, types, scopes, statuses } = useNoteEditConfig();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const vscode = useVscodeApi();

  useEffect(() => {
    setIsSubmitting(false);
    setSubmitError(null);
  }, [note.id]);

  useWebviewHostMessageHandler('noteUpdated', (data) => {
    const msg = data as NoteUpdatedMessage;
    if (msg.type !== 'noteUpdated' || !('success' in msg)) {
      return;
    }
    setIsSubmitting(false);
    if (msg.success) {
      setSubmitError(null);
      onClose();
    } else {
      setSubmitError(msg.error ?? 'Update failed');
    }
  });

  const schema = useMemo(
    () => buildNoteEditSchema(priorityNames, types, scopes, statuses),
    [priorityNames, types, scopes, statuses]
  );

  const form = useForm<NoteEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: note.content,
      priority: note.priority,
      type: note.type,
      scope: note.scope,
      status: note.status,
    },
  });

  useEffect(() => {
    form.reset({
      content: note.content,
      priority: note.priority,
      type: note.type,
      scope: note.scope,
      status: note.status,
    });
  }, [note, form]);

  const submitUpdate = (values: NoteEditFormValues): void => {
    setIsSubmitting(true);
    setSubmitError(null);
    webviewHostService.updateNote(vscode, {
      noteId: note.id,
      content: values.content,
      priority: values.priority,
      noteType: values.type,
      scope: values.scope,
      status: values.status,
    });
  };

  return (
    <Dialog
      defaultOpen
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="gap-6"
        onPointerDownOutside={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit note</DialogTitle>
          <DialogDescription>
            Update content and metadata. Changes are saved to workspace storage.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <NoteEditForm
            submitError={submitError}
            isSubmitting={isSubmitting}
            onClose={onClose}
            onSubmit={submitUpdate}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}
