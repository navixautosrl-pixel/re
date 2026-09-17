/**
 * Shared honest-stub submit for every demo form (reservation, contact,
 * checkout, etc.) — these are frontend-only demos with no backend, so this
 * always resolves to a rejected NOT_CONNECTED rather than faking success.
 * Each form's error state should surface that plainly (see Contact.tsx on
 * the main site for the pattern), never claim data was actually sent.
 */
export async function submitDemoForm<T>(payload: T): Promise<{ ok: true }> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  void payload;
  throw new Error("NOT_CONNECTED");
}
