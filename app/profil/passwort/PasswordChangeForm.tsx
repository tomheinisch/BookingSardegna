"use client";

import { useActionState } from "react";
import { changeOwnPassword } from "@/app/actions/benutzer";

export default function PasswordChangeForm() {
  const [state, action, pending] = useActionState(changeOwnPassword, null);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Aktuelles Passwort</label>
        <input
          name="current"
          type="password"
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Neues Passwort</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">Mindestens 8 Zeichen</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Neues Passwort bestätigen</label>
        <input
          name="confirm"
          type="password"
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {pending ? "Wird gespeichert…" : "Passwort ändern"}
      </button>
    </form>
  );
}
