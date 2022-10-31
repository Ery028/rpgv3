import Database from '../database/database.js';
import Sendmail from '../services/SendMail.js';
import jwt from 'jsonwebtoken';

async function readAll() {
  const db = await Database.connect();

  const sql = `
    SELECT 
      f.id, f.name, f.image, f.personagem, c.name as category
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
      f.id, f.name, f.image, f.personagem, c.name as category
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
      fichas
    WHERE
      id = ?
  `;

  const ficha = await db.get(sql, [id]);

  return ficha;
}

async function create(ficha) {
  const db = await Database.connect();

  const { name, image, personagem, category_id } = ficha;

  const sql = `
    INSERT INTO
      fichas (name, image, personagem, category_id)
    VALUES
      (?, ?, ?, ?)
  `;

  const { lastID } = await db.run(sql, [name, image, personagem, category_id]);
  
  const newFicha = await readId(lastID);
  
  return newFicha;
}

async function update(ficha, id) {
  const db = await Database.connect();

  const { name, image, personagem, category_id } = ficha;

  const sql = `
    UPDATE 
      fichas
    SET
      name = ?, image = ?, personagem = ?, category_id = ?
    WHERE
      id = ?
  `;

  const { changes } = await db.run(sql, [name, image, personagem, category_id, id]);

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


export default { readAll, read, create, update, destroy };
