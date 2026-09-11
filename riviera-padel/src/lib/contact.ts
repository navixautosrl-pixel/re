export type ContactPayload = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

/**
 * INTEGRATION POINT — no real backend exists yet (this is a static export,
 * no API routes). Replace this stub with a real call once a submission
 * endpoint exists (a serverless function, Formspree, or similar) so
 * messages actually reach Riviera instead of only validating client-side.
 */
export async function submitContactForm(payload: ContactPayload): Promise<{ ok: true }> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  void payload;
  throw new Error("NOT_CONNECTED");
}
