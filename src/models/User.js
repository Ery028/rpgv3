import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from '../database/database.js';
import Sendmail from '../services/SendMail.js'

const salt = Number(process.env.SALT);

async function create(user) {
  const db = await Database.connect();

  const { name, email, password } = user;

  const hash = bcrypt.hashSync(password, salt);

  const sql = `
    INSERT INTO
      users (name, email, password)
    VALUES
      (?, ?, ?)
  `;

  const { lastID } = await db.run(sql, [name, email, hash]);
  EmailText(email);
  return read(lastID);
}

async function read(id) {
  const db = await Database.connect();

  const sql = `
    SELECT 
      *
    FROM 
      users
    WHERE
      id = ?
  `;

  const user = await db.get(sql, [id]);

  return user;
}

async function readByEmail(email) {
  const db = await Database.connect();

  const sql = `
    SELECT 
      *
    FROM 
      users
    WHERE
      email = ?
  `;

  const user = await db.get(sql, [email]);

  return user;
}

function EmailText(to){
  console.log(to)
  const subject = 'Conta criada no Fichas App';
  const text = `Conta criada com sucesso.\n\nAcesse o aplicativo para gerenciar o cadastro de Fichas.`;
  const html = `<h1>Conta criada com sucesso.</h1><p>Acesse o aplicativo para gerenciar o cadastro de Fichas.</p>`;

  Sendmail.submitEmail(to,subject,text,html);
}

export default { create, read, readByEmail };
