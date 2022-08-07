// eslint-disable-next-line import/no-unresolved
const bcrypt = require('bcrypt');
// eslint-disable-next-line import/no-unresolved
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { ERROR_BAD_REQUEST, ERROR_NOT_FOUND, ERROR_DEFAULT } = require('../errors/errors');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

const getUserId = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => {
      const error = new Error('Пользователь по указанному _id не найден');
      error.statusCode = ERROR_NOT_FOUND;
      throw error;
    })
    .then((userId) => res.send({ data: userId }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию.' });
      }
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!email || !password) {
    const error = new Error('Не передан email или пароль');
    error.statusCode = ERROR_BAD_REQUEST;
    throw error;
  }

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .catch((err) => {
      if (err.name === 'ConflictError' || err.code === 11000) {
        const error = new Error('Пользователь с таким email уже существует');
        error.statusCode = 409;
        throw error;
      } else next(err);
    })
    .then((user) => res.status(200).send({
      data: {
        name: user.name, about: user.about, avatar, email: user.email,
      },
    }))
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail(() => {
      const error = new Error('Пользователь с таким id не найден');
      error.statusCode = ERROR_NOT_FOUND;
      throw error;
    })
    .catch(next)
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля' });
      } else if (err.statusCode === ERROR_NOT_FOUND) {
        res.status(ERROR_NOT_FOUND).send({ message: err.message });
      } else {
        res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию.' });
      }
    })
    .catch(next);
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      const error = new Error('Пользователь с таким id не найден');
      error.statusCode = ERROR_NOT_FOUND;
      throw error;
    })
    .catch(next)
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      } else if (err.statusCode === ERROR_NOT_FOUND) {
        res.status(ERROR_NOT_FOUND).send({ message: err.message });
      } else {
        res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию.' });
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'secret-key',
        { expiresIn: '7d' },
      );

      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      })
        .send({ message: 'Авторизация прошла успешно' });
    })
    .catch(() => {
      const error = new Error('Ошибка авторизации');
      error.statusCode = 401;
      throw error;
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию.' });
      }
    })
    .catch(next);
};

const getInfoUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .then((user) => res.send(user))
    .catch(next);
};

module.exports = {
  getUsers,
  getUserId,
  createUser,
  updateUser,
  updateAvatar,
  login,
  getInfoUser,
};
