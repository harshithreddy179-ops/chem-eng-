"use client";

import { startTransition, useActionState } from "react";
import { initialActionState, type ActionState } from "@/actions/types";

/**
 * Wraps a Server Action for admin forms. Submitting through onSubmit (rather
 * than `<form action>`) keeps every field intact when validation fails —
 * React only auto-resets forms that use the `action` prop.
 */
export function useAdminForm(serverAction: (prev: ActionState, formData: FormData) => Promise<ActionState>) {
  const [state, dispatch, pending] = useActionState(serverAction, initialActionState);
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => dispatch(formData));
  }
  return { state, onSubmit, pending };
}
