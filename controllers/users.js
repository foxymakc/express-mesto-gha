// eslint-disable-next-line import/no-unresolved
const bcrypt = require('bcrypt');
// eslint-disable-next-line import/no-unresolved
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ErrorBadRequest = require('../errors/ErrorBadRequest');
const ErrorNotFound = require('../errors/ErrorNotFound');
const ErrorConflict = require('../errors/ErrorConflict');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

const getUserId = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.statys(200).send(user);
      } else {
        throw new ErrorNotFound('Пользователь по указанному _id не найден');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ErrorBadRequest('Переданы невалидный id'));
      }
      next(err);
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!email || !password) {
    throw new ErrorBadRequest('Не передан email или пароль');
  }

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .catch((err) => {
      if (err.name === 'ConflictError' || err.code === 11000) {
        throw new ErrorConflict('Пользователь с таким email уже существует');
      }
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
      throw new ErrorNotFound('Пользователь не найден');
    })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new ErrorBadRequest('Переданы некорректные данные при обновлении профиля'));
      }
      next(err);
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      throw new ErrorNotFound('Пользователь не найден');
    })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new ErrorBadRequest('Переданы некорректные данные при обновлении профиля'));
      }
      next(err);
    });
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
  User.findById(req.user._id)
    .orFail()
    .catch(() => {
      throw new ErrorNotFound('Пользователь с таким id не найден');
    })
    .then((user) => res.status(200).send(user))
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
