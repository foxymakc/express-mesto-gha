// eslint-disable-next-line import/no-unresolved
const bcrypt = require('bcrypt');
// eslint-disable-next-line import/no-unresolved
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ErrorBadRequest = require('../errors/ErrorBadRequest');
const ErrorNotFound = require('../errors/ErrorNotFound');
const ErrorDefault = require('../errors/ErrorDefault');
const ErrorConflict = require('../errors/ErrorConflict');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => {
      throw new ErrorDefault('Ошибка по умолчанию.');
    })
    .catch(next);
};

const getUserId = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .catch(() => {
      throw new ErrorNotFound('Пользователь по указанному _id не найден');
    })
    .catch(next)
    .then((userId) => res.send({ data: userId }))
    .catch(() => {
      throw new ErrorDefault('Ошибка по умолчанию.');
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!email || !password) {
    next(new ErrorBadRequest('Не передан email или пароль'));
  }

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(200).send({
      data: {
        name: user.name, about: user.about, avatar, email: user.email,
      },
    }))
    .catch((err) => {
      if (err.name === 'ConflictError' || err.code === 11000) {
        throw new ErrorConflict('Пользователь с таким email уже существует');
      }
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail()
    .catch(() => {
      throw new ErrorNotFound('Пользователь по указанному _id не найден');
    })
    .catch(next)
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new ErrorBadRequest('Переданы некорректные данные при обновлении профиля');
      } else if (err.statusCode === ErrorNotFound) {
        throw new ErrorNotFound({ message: err.message });
      } else {
        throw new ErrorDefault('Ошибка по умолчанию.');
      }
    })
    .catch(next);
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail()
    .catch(() => {
      throw new ErrorNotFound('Пользователь по указанному _id не найден');
    })
    .catch(next)
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new ErrorBadRequest('Переданы некорректные данные при обновлении аватара');
      } else if (err.statusCode === ErrorNotFound) {
        throw new ErrorNotFound({ message: err.message });
      } else {
        throw new ErrorDefault('Ошибка по умолчанию.');
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
        sameSite: true,
      })
        .send({ message: 'Авторизация прошла успешно' });
    })
    .catch(next);
};

const getInfoUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .then((user) => res.send(user))
    .catch(() => {
      throw new ErrorDefault({ message: 'Ошибка по умолчанию.' });
    })
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
