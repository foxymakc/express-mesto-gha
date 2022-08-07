// eslint-disable-next-line import/no-unresolved
const jwt = require('jsonwebtoken');
const ErrorUnauthorized = require('../errors/ErrorUnauthorized');

const { JWT_SECRET = 'secret-key' } = process.env;

const auth = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new ErrorUnauthorized('Требуется авторизация');
  }
  req.user = payload;

  next();
};

module.exports = { auth };
