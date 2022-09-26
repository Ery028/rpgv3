import Database from '../database/database.js';
import Sendmail from '../services/SendMail.js';
import jwt from 'jsonwebtoken';

async function readAll() {
  const db = await Database.connect();

  const sql = `
    SELECT 
      f.id, f.name, f.personagem, c.name as category
    FROM 
      fichas as f INNER JOIN categories as c
    ON
      f.category_id = c.id
  `;

  const fichas = await db.all(sql);

  return fichas;
}

async function read(id) {
  const db = await Database.connect();

  const sql = `
    SELECT 
      f.id, f.name, f.personagem, c.name as category
    FROM 
      fichas as f INNER JOIN categories as c
    ON
      f.category_id = c.id
    WHERE
      f.id = ?
  `;

  const ficha = await db.get(sql, [id]);

  return ficha;
}

async function readId(id) {
  const db = await Database.connect();

  const sql = `
    SELECT 
      *
    FROM 
      users
    WHERE
      id = ?
  `;

  const ficha = await db.get(sql, [id]);

  return ficha;
}

async function create(ficha) {
  const db = await Database.connect();

  const { name, personagem, category_id, token } = ficha;
  const {userId} = jwt.verify(token, process.env.SECRET);
  const sql = `
    INSERT INTO
      fichas (name, personagem, category_id)
    VALUES
      (?, ?, ?)
  `;

  const { lastID } = await db.run(sql, [name, personagem, category_id]);
  
  const {email} = await readId(userId);
  EmailText(email);
  return read(lastID);
}

async function update(ficha, id) {
  const db = await Database.connect();

  const { name, personagem, category_id } = ficha;

  const sql = `
    UPDATE 
      fichas
    SET
      name = ?, personagem = ?, category_id = ?
    WHERE
      id = ?
  `;

  const { changes } = await db.run(sql, [name, personagem, category_id, id]);

  if (changes === 1) {
    return read(id);
  } else {
    return false;
  }
}

async function destroy(id) {
  const db = await Database.connect();

  const sql = `
    DELETE FROM
      fichas
    WHERE
      id = ?
  `;

  const { changes } = await db.run(sql, [id]);

  return changes === 1;
}

function EmailText(to){
  // console.log(to)
  const subject = 'Ficha criada no Fichas App';
  const text = `Ficha criada com sucesso.\n\nAcesse o aplicativo para gerenciar o cadastro de fichas.`;
  const html = `<h1>Ficha criada com sucesso.</h1><p>Acesse o aplicativo para gerenciar o cadastro de fichas.</p>`;

  Sendmail.submitEmail(to,subject,text,html);
}

export default { readAll, read, create, update, destroy };
