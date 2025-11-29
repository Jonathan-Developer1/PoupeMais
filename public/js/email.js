import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function enviarCodigo(destinatarioEmail, codigo) {
   console.log(`Tentando enviar e-mail para: ${destinatarioEmail} com usuário SMTP: ${process.env.SMTP_USER}`);
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: destinatarioEmail,
    subject: "Seu código de verificação do PoupeMais",
    html: `
   <h1>Bem-vindo ao PoupeMais!</h1>
   <p>Use o seguinte código para verificar seu cadastro:</p>
   <h2>${codigo}</h2>
   <p>Se você não solicitou este código, por favor, ignore este e-mail.</p>
  `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log("E-mail enviado: %s", info.messageId);
    return true;
  } catch (error) {

    console.error(" ERRO NO NODEMAILER/BREVO:", error.message);
    return false;
  }
}