import * as React from 'react';
import { FormProvider } from 'react-hook-form';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

type FormProps<T extends FieldValues> = React.PropsWithChildren<UseFormReturn<T>>;

/** FormProvider: wrap the native form element so descendants can use useFormContext. */
export function Form<T extends FieldValues>(props: FormProps<T>): React.ReactElement {
  const { children, ...methods } = props;
  return <FormProvider {...methods}>{children}</FormProvider>;
}
