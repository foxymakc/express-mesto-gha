const Card = require('../models/card');
const { ERROR_BAD_REQUEST, ERROR_NOT_FOUND, ERROR_DEFAULT } = require('../errors/errors');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию' }));
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_BAD_REQUEST).send({
          message: 'Переданы некорректные данные при создании карточки',
        });
      } else {
        res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию' });
      }
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(() => {
      const error = new Error('Карточка не найдена');
      error.statusCode = ERROR_NOT_FOUND;
      throw error;
    })
    .catch(next)
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'IncorrectDetaError' || err.name === 'CastError') {
        res.status(ERROR_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      } else if (err.statusCode === ERROR_NOT_FOUND) {
        res.status(ERROR_NOT_FOUND).send({ message: err.message });
      } else {
        res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию' });
      }
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      const error = new Error('Карточка не найдена');
      error.statusCode = ERROR_NOT_FOUND;
      throw error;
    })
    .catch(next)
    .then((likes) => res.send({ data: likes }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки/снятии лайка' });
      } else if (err.statusCode === ERROR_NOT_FOUND) {
        res.status(ERROR_NOT_FOUND).send({ message: err.message });
      } else {
        res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию' });
      }
    })
    .catch(next);
};

const deleteLikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      const error = new Error('Карточка не найдена');
      error.statusCode = ERROR_NOT_FOUND;
      throw error;
    })
    .catch(next)
    .then((likes) => res.send({ data: likes }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки/снятии лайка' });
      } else if (err.statusCode === ERROR_NOT_FOUND) {
        res.status(ERROR_NOT_FOUND).send({ message: err.message });
      } else {
        res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию' });
      }
    })
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  deleteLikeCard,
};
