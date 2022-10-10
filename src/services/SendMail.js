import nodemailer from 'nodemailer';
import mailConfig from '../config/mail.js';

async function submitEmail(to, subject, text, html) {
  try {
    const config = await mailConfig();

    const transporter = nodemailer.createTransport(config);

    const info = await transporter.sendMail({
      from: 'noreplay@email.com',
      to,
      subject: subject,
      text: text,
      html: html,
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Send email: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (err) {
    throw new Error(err);
  }
}

function newFicha(to){
  const subject = 'Ficha criada no Fichas App';
  const text = `Ficha criada com sucesso.\n\nAcesse o aplicativo para gerenciar o cadastro de fichas.`;
  const html = `<h1>Ficha criada com sucesso.</h1><p>Acesse o aplicativo para gerenciar o cadastro de fichas.</p>`;

  submitEmail(to,subject,text,html);
}

function newUser(to){
  console.log(to)
  const subject = 'Conta criada no Fichas App';
  const text = `Conta criada com sucesso.\n\nAcesse o aplicativo para gerenciar o cadastro de Fichas.`;
  const html = `<h1>Conta criada com sucesso.</h1><p>Acesse o aplicativo para gerenciar o cadastro de Fichas.</p>`;

  ubmitEmail(to,subject,text,html);
}

export default { submitEmail, newFicha, newUser };