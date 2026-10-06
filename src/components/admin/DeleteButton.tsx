"use client";

import { deleteRecord } from "@/actions/admin";

export function DeleteButton({ table, id, label = "Delete" }: { table: "resources" | "chapters" | "pyqs"; id: string; label?: string }) {
  return (
    <form
      action={deleteRecord}
      onSubmit={(e) => {
        if (!window.confirm("Delete permanently? This cannot be undone.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="font-sans text-sm text-red-300/80 hover:text-red-200">
        {label}
      </button>
    </form>
  );
}
