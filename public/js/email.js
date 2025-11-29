const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function enviarCodigo(destinatario, codigo) {
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
    console.error("Erro ao enviar e-mail:", err);
    return false;
  }
}

module.exports = { enviarCodigo };
