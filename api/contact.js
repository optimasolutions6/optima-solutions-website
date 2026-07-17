
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { name, phone, zip, interest, message } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: "Missing required fields" });

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.LEADS_TO_EMAIL;
  const sender = process.env.LEADS_FROM_EMAIL || "Optima Solutions <onboarding@resend.dev>";
  if (!apiKey || !recipient) return res.status(503).json({ error: "Lead delivery is not configured" });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      subject: `Nuevo lead web: ${interest || "Consulta general"}`,
      html: `<h2>Nuevo lead de Optima Solutions</h2>
        <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
        <p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Código postal:</strong> ${escapeHtml(zip || "")}</p>
        <p><strong>Interés:</strong> ${escapeHtml(interest || "")}</p>
        <p><strong>Mensaje:</strong> ${escapeHtml(message || "")}</p>`
    })
  });
  if (!response.ok) return res.status(502).json({ error: "Email provider error" });
  return res.status(200).json({ ok: true });
}
function escapeHtml(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
