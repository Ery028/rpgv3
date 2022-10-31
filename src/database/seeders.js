import { resolve } from 'path';
import { readFileSync } from 'fs';
import Ficha from '../models/Ficha.js';
import Category from '../models/Category.js';

async function up() {
  const file = resolve(process.cwd(), 'src', 'database', 'seeders.json');

  const content = JSON.parse(readFileSync(file));

  for (const category of content.categories) {
    await Category.create(category);
  }

  for (const ficha of content.fichas) {
    await Ficha.create(ficha);
  }
}

export default { up };
