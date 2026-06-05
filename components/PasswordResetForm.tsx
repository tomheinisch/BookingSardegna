"use client";

import { useActionState, useState } from "react";
import { resetUserPassword } from "@/app/actions/benutzer";
import { KeyRound, X } from "lucide-react";

interface Props {
  userId: string;
  userName: string;
}

export default function PasswordResetForm({ userId, userName }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(resetUserPassword, null);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Passwort zurücksetzen"
        className="text-gray-400 hover:text-blue-600 transition-colors"
      >
        <KeyRound size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Passwort zurücksetzen</h2>
            <p className="text-sm text-gray-500 mb-4">für <span className="font-medium">{userName}</span></p>

            <form action={action} className="space-y-3">
              <input type="hidden" name="userId" value={userId} />
              <div>
                <label className="block text-sm font-medium text-gray-700">Neues Passwort</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Passwort bestätigen</label>
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

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {pending ? "Wird gespeichert…" : "Zurücksetzen"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
