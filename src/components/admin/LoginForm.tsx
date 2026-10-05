"use client";

import { signIn } from "@/actions/auth";
import { useAdminForm } from "@/hooks/use-admin-form";
import { FormBanner, SubmitButton } from "./AdminForm";

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const { state, onSubmit, pending } = useAdminForm(signIn);
  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      {notice && !state.message && <FormBanner state={{ ok: false, message: notice }} />}
      <FormBanner state={state} />
      <label className="block">
        <span className="field-label">Email</span>
        <input name="email" type="email" autoComplete="email" required className="field" />
      </label>
      <label className="block">
        <span className="field-label">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="field" />
      </label>
      <SubmitButton pending={pending} className="w-full">
        Enter
      </SubmitButton>
    </form>
  );
}
