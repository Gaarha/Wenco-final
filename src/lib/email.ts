import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

interface HallazgoNotificationData {
  title: string
  location: string
  date: Date
  teamName: string
  reportedByName: string
  reportedByEmail: string
  driveLinks: string[]
}

export async function sendHallazgoNotification(data: HallazgoNotificationData) {
  const transporter = getTransporter()
  const fechaFormateada = data.date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const fotosHtml = data.driveLinks.length > 0
    ? data.driveLinks.map((link, i) => `<p><a href="${link}" style="color:#2563eb;">Ver foto ${i + 1} en Google Drive</a></p>`).join('')
    : '<p>Sin fotografías adjuntas.</p>'

  const adminHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
      <h2 style="color:#1e40af;margin-top:0;">Nuevo Hallazgo Registrado</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;font-weight:bold;color:#374151;width:40%;">Ítem encontrado:</td><td style="padding:8px 0;color:#111827;">${data.title}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Ubicación:</td><td style="padding:8px 0;color:#111827;">${data.location}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Fecha:</td><td style="padding:8px 0;color:#111827;">${fechaFormateada}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Equipo:</td><td style="padding:8px 0;color:#111827;">${data.teamName}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Reportado por:</td><td style="padding:8px 0;color:#111827;">${data.reportedByName} (${data.reportedByEmail})</td></tr>
      </table>
      <div style="margin-top:16px;">
        <p style="font-weight:bold;color:#374151;margin-bottom:8px;">Fotografías:</p>
        ${fotosHtml}
      </div>
    </div>
  `

  const confirmacionHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
      <h2 style="color:#15803d;margin-top:0;">Hallazgo Registrado Exitosamente</h2>
      <p>Hola <strong>${data.reportedByName}</strong>,</p>
      <p>Tu reporte de hallazgo ha sido registrado correctamente.</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;font-weight:bold;color:#374151;width:40%;">Ítem:</td><td style="padding:8px 0;color:#111827;">${data.title}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Ubicación:</td><td style="padding:8px 0;color:#111827;">${data.location}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Fecha:</td><td style="padding:8px 0;color:#111827;">${fechaFormateada}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Equipo:</td><td style="padding:8px 0;color:#111827;">${data.teamName}</td></tr>
      </table>
      <p style="color:#6b7280;margin-top:16px;font-size:14px;">El administrador ha sido notificado. Gracias por usar la plataforma de hallazgos.</p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"Plataforma Hallazgos" <${process.env.GMAIL_USER}>`,
      to: process.env.EMAIL_ADMIN,
      subject: `Nuevo hallazgo registrado: ${data.title}`,
      html: adminHtml,
    })

    await transporter.sendMail({
      from: `"Plataforma Hallazgos" <${process.env.GMAIL_USER}>`,
      to: data.reportedByEmail,
      subject: `Tu hallazgo fue registrado: ${data.title}`,
      html: confirmacionHtml,
    })
  } catch (error) {
    console.error('Error sending email notification:', error)
  }
}
