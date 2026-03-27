import React, { type ReactElement } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Button } from '../ui/button';
import { DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useNoteEditConfig } from '../../hooks/useNoteEditConfig';
import type { NoteEditFormValues } from '../../schemas/noteEditSchema';

const fieldLabelClass =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground';

export interface NoteEditFormProps {
  submitError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: NoteEditFormValues) => void;
}

export function NoteEditForm({
  submitError,
  isSubmitting,
  onClose,
  onSubmit,
}: NoteEditFormProps): ReactElement {
  const { priorityNames, types, scopes, statuses } = useNoteEditConfig();
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useFormContext<NoteEditFormValues>();

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit((values) => {
        onSubmit(values);
      })}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cs-edit-content" className={fieldLabelClass}>
          Content
        </Label>
        <Textarea id="cs-edit-content" rows={5} className="leading-relaxed" {...register('content')} />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cs-edit-priority" className={fieldLabelClass}>
            Priority
          </Label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="cs-edit-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.priority && (
            <p className="text-xs text-destructive">{errors.priority.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cs-edit-type" className={fieldLabelClass}>
            Type
          </Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="cs-edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cs-edit-scope" className={fieldLabelClass}>
            Scope
          </Label>
          <Controller
            control={control}
            name="scope"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="cs-edit-scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scopes.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.scope && (
            <p className="text-xs text-destructive">{errors.scope.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cs-edit-status" className={fieldLabelClass}>
            Status
          </Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="cs-edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-xs text-destructive">{errors.status.message}</p>
          )}
        </div>
      </div>

      {submitError && (
        <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm leading-snug text-destructive">
          {submitError}
        </p>
      )}

      <DialogFooter className="gap-3 pt-1 sm:gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={isSubmitting}
          onClick={onClose}
          className="rounded-full"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[8rem] rounded-full font-semibold">
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}
