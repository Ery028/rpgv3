import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { celebrate, Joi, errors, Segments } from 'celebrate';

import uploadConfig from './config/multer.js';
import Category from './models/Category.js';
import Ficha from './models/Ficha.js';
import User from './models/User.js';

import { isAuthenticated } from './middleware/auth.js';

import SendMail from './services/SendMail.js';

const router = Router();

router.get('/', (req, res) => res.redirect('/fichas.html'));

router.get('/fichas', isAuthenticated, async (req, res) => {
  try {
    const fichas = await Ficha.readAll();

    res.json(fichas);
  } catch (error) {
    throw new Error('Error in list fichas');
  }
});

router.post(
  '/fichas',
  isAuthenticated,
  multer(uploadConfig).single('image'),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
      price: Joi.number().precision(2),
      category_id: Joi.number().integer(),
    }),
  }),
  async (req, res) => {
    try {
      const ficha = req.body;

      const image = req.file
      ? `/img/fichas/${req.file.filename}`
      : '/img/fichas/placeholder.jpg';

      const newFicha = await Ficha.create({ ...ficha, image });

      const user = await User.read(req.userId)

      SendMail.newFicha(user.email);

      res.json(newFicha);
    
    } catch (error) {
      throw new Error('Error in create ficha');
    }
  }
);

router.put(
  '/fichas/:id',
  isAuthenticated,
  multer(uploadConfig).single('image'),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
      price: Joi.number().precision(2),
      category_id: Joi.number().integer(),
    }),
  }),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const ficha = req.body;

      const image = req.file
        ? `/img/fichas/${req.file.filename}`
        : '/img/fichas/placeholder.jpg';

      const newFicha = await Ficha.update({ ...ficha, image }, id);

      if (newFicha) {
        res.json(newFicha);
      } else {
        res.status(400).json({ error: 'Ficha not found.' });
      }
    } catch (error) {
      throw new Error('Error in update ficha');
    }
  }
);

router.delete('/fichas/:id', isAuthenticated, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (await Ficha.destroy(id)) {
      res.status(204).send();
    } else {
      res.status(400).json({ error: 'Ficha not found.' });
    }
  } catch (error) {
    throw new Error('Error in delete ficha');
  }
});

router.get('/categories', isAuthenticated, async (req, res) => {
  try {
    const categories = await Category.readAll();

    res.json(categories);
  } catch (error) {
    throw new Error('Error in list categories');
  }
});

router.post(
  '/users',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().email(),
      password: Joi.string().min(8),
      confirmation_password: Joi.string().min(8),
    }),
  }),
  async (req, res) => {
    try {
      const user = req.body;

      const newUser = await User.create(user);

      await SendMail.createNewUser(user.email);

      res.json(newUser);
    } catch (error) {
      throw new Error('Error in create user');
    }
    }
  
);

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.readByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    const { id: userId, password: hash } = user;

    const match = await bcrypt.compareSync(password, hash);

    if (match) {
      const token = jwt.sign(
        { userId },
        process.env.SECRET,
        { expiresIn: 3600 } // 1h
      );

      res.json({ auth: true, token });
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(401).json({ error: 'User not found' });
  }
});

router.use(function (req, res, next) {
  res.status(404).json({
    message: 'Content not found',
  });
});

router.use(errors());

router.use(function (error, req, res, next) {
  console.error(error.stack);

  res.status(500).json({
    message: 'Something broke!',
  });
});

export default router;
