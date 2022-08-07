// eslint-disable-next-line import/no-unresolved
const jwt = require('jsonwebtoken');

const { JWT_SECRET = 'secret-key' } = process.env;

const auth = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const error = new Error('Требуется авторизация');
    error.statusCode = 401;
    throw error;
  }
  req.user = payload;

  next();
};

module.exports = { auth };
