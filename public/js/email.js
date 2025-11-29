import nodemailer from "nodemailer";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})
export async function enviarCodigo(destinatario, codigo) { // Exportação nomeada
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: destinatario,
      subject: "Código de verificação PoupeMais",
      text: `Seu código de verificação é: ${codigo}`
    });
    console.log("E-mail enviado:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Erro ao enviar e-mail (Brevo/Nodemailer):", err);
    return false;
  }
}