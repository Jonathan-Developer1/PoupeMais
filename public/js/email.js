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
//envio do código
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
//boas vindas para usuario após o cadastro
export async function enviarBoasVindas(destinatarioEmail, nome) {
  console.log(`Tentando enviar e-mail de boas-vindas para: ${destinatarioEmail}`);

  const primeiroNome = nome.split(" ")[0];

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: destinatarioEmail,
    subject: "🎉 Bem-vindo(a) ao PoupeMais!",
    html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto; text-align: center;">
      <img src="cid:PoupeMaisLogo" alt="PoupeMais" width="120" style="display:block; margin: 20px auto;" />
      
      <h2 style="color: #2E8B57;">Olá, ${primeiroNome}!</h2>
      <p style="font-size: 16px; margin: 10px 0;">
        Seu cadastro no <strong>PoupeMais</strong> foi realizado com sucesso! 🥳💚
      </p>
      
      <p style="font-size: 15px; margin: 15px 0 5px;">Agora você pode:</p>
      <ul style="text-align: left; display: inline-block; margin: 0; padding-left: 20px; font-size: 14px;">
        <li>Registrar suas receitas e despesas</li>
        <li>Acompanhar seu saldo e evolução financeira</li>
        <li>Visualizar gráficos detalhados de gastos e economia</li>
        <li>Receber dicas de economia e planejamento com nossa IA exclusiva</li>
        <li>Planejar suas metas financeiras com facilidade</li>
      </ul>
      
      <p style="font-size: 15px; margin: 15px 0;">Estamos felizes em ter você conosco!</p>
      <p style="font-size: 15px; margin: 0;">Equipe <strong>PoupeMais</strong></p>
    </div>
  `,
    attachments: [
      {
        filename: "PoupeMais-logo.png",
        path: "./public/img/PoupeMais-logo.png",
        cid: "PoupeMaisLogo"
      }
    ]
  };


  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail de boas-vindas enviado: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("ERRO AO ENVIAR EMAIL DE BOAS-VINDAS:", error.message);
    return false;
  }
}

// Envio do link de redefinição de senha do esqueci

export async function enviarLinkRedefinicao(destinatarioEmail, token) {
  console.log(`Tentando enviar link de redefinição para: ${destinatarioEmail}`);


  const DOMAIN = "http://localhost:3000";
  const resetLink = `${DOMAIN}/alterarSenha2.html?token=${token}`;

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: destinatarioEmail,
    subject: "Solicitação de Redefinição de Senha - PoupeMais",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto; text-align: center;">
        
        <h2 style="color: #3a8d67;">Redefinição de Senha</h2>
        <p>Você solicitou uma nova senha para sua conta no PoupeMais.</p>
        
        <p style="margin: 20px 0;">
          Clique no botão abaixo para continuar a redefinição:
        </p>
        
        <a href="${resetLink}" style="
          display: inline-block;
          padding: 10px 20px;
          margin-top: 10px;
          background-color: #3a8d67; 
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">
          DEFINIR NOVA SENHA
        </a>
        
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          Este link de segurança só é válido por 1 hora.
        </p>
        <p style="font-size: 14px; color: #666;">
          Se você não fez esta solicitação, apenas ignore este e-mail.
        </p>
      </div>
    `,

  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail de redefinição enviado: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("ERRO AO ENVIAR LINK DE REDEFINIÇÃO:", error.message);
    return false;
  }
}

//Informar que a senha foi redefinida
// email.js

export async function enviarSenhaRedefinida(destinatarioEmail, nome) {
    console.log(`Tentando enviar notificação de redefinição para: ${destinatarioEmail}`);

    const primeiroNome = nome.split(" ")[0];

    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: destinatarioEmail,
        subject: "🔒 Sua Senha Foi Alterada com Sucesso - PoupeMais",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto; text-align: center; border: 1px solid #ddd; padding: 20px;">
                
                <h2 style="color: #2E8B57;">Olá, ${primeiroNome}!</h2>
                <p style="font-size: 16px; margin: 10px 0;">
                    Sua senha de acesso ao <strong>PoupeMais</strong> foi alterada com sucesso!
                </p>
                
                <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="font-size: 14px; margin: 0;">
                        <strong>Atenção:</strong> Se você não solicitou ou não fez esta alteração de senha, entre em contato com o suporte imediatamente!
                    </p>
                </div>

                <p style="font-size: 15px; margin: 15px 0;">
                    Sua conta agora está segura. Você já pode fazer login com a nova senha.
                </p>

                <p style="font-size: 15px; margin: 0;">Equipe <strong>PoupeMais</strong></p>
            </div>
        `,
        // REMOVIDO O BLOCO attachments
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Notificação de senha redefinida enviada: %s", info.messageId);
        return true;

    } catch (error) {
        console.error("ERRO AO ENVIAR EMAIL DE SENHA REDEFINIDA:", error.message);
        return false;
    }
}