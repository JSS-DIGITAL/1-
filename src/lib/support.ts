// In-app support & feedback — posts to the founder's n8n automations.
// "help" gets an instant AI-drafted email reply (grounded, no invented
// features); bug/idea/love land in the feedback log (bugs page the founder).

const SUPPORT_URL = "https://jssdigital.app.n8n.cloud/webhook/one-percent-support";
const FEEDBACK_URL = "https://jssdigital.app.n8n.cloud/webhook/one-percent-feedback";

export type MessageKind = "help" | "bug" | "idea" | "love";

export async function sendSupportMessage(opts: {
  kind: MessageKind;
  email: string;
  name?: string;
  message: string;
}): Promise<boolean> {
  const isHelp = opts.kind === "help";
  const url = isHelp ? SUPPORT_URL : FEEDBACK_URL;
  const payload = isHelp
    ? { email: opts.email, name: opts.name ?? "", message: opts.message }
    : { email: opts.email, kind: opts.kind, message: opts.message };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
