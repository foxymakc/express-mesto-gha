// eslint-disable-next-line import/no-unresolved
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (link) => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,}\.[a-z0-9]{1,10}\b([-a-z0-9-._~:/?#@!$&'()*+,;=]*)/gmi.test(link),
      message: 'Введён некорректный URL',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(email) {
        return isEmail(email);
      },
      message: 'Не валидный адресс электронной почты',
    },
  },
  password: {
    type: String,
    required: true,
    unique: true,
    select: false,
  },
});

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        const error = new Error('Неверные почта или пароль');
        error.statusCode = 401;
        throw error;
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            const error = new Error('Неверные почта или пароль');
            error.statusCode = 401;
            throw error;
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
