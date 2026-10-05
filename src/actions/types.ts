export interface ActionState {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Submitted values, echoed back on failure so the form keeps its input. */
  values?: Record<string, string>;
}

export const initialActionState: ActionState = { ok: false };
