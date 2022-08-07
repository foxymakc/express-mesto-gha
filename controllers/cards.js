const Card = require('../models/card');
const ErrorBadRequest = require('../errors/ErrorBadRequest');
const ErrorNotFound = require('../errors/ErrorNotFound');
const ErrorDefault = require('../errors/ErrorDefault');
const ErrorForbidden = require('../errors/ErrorForbidden');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => {
      throw new ErrorDefault('Ошибка по умолчанию.');
    })
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new ErrorBadRequest('Переданы некорректные данные при создании карточки'));
      } else {
        next(new ErrorDefault('Ошибка по умолчанию.'));
      }
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  const userId = req.user._id;
  const { _id } = req.params;
  Card.findByIdAndRemove(_id)
    .orFail()
    .catch(() => {
      throw new ErrorNotFound('Карточка не найдена');
    })
    .catch(next)
    .then((card) => {
      if (card.owner.toString() === userId) {
        Card.findByIdAndRemove(_id)
          .then((cardData) => res.send(cardData));
      } else {
        throw new ErrorForbidden('Недостаточно прав для выполнения');
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
    .orFail()
    .catch(() => {
      throw new ErrorNotFound('Карточка не найдена');
    })
    .catch(next)
    .then((likes) => res.send({ data: likes }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new ErrorBadRequest('Переданы некорректные данные для постановки/снятии лайка');
      } else if (err.statusCode === ErrorNotFound) {
        throw new ErrorNotFound({ message: err.message });
      } else {
        throw new ErrorDefault('Ошибка по умолчанию.');
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
    .orFail()
    .catch(() => {
      throw new ErrorNotFound('Карточка не найдена');
    })
    .catch(next)
    .then((likes) => res.send({ data: likes }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new ErrorBadRequest('Переданы некорректные данные для постановки/снятии лайка');
      } else if (err.statusCode === ErrorNotFound) {
        throw new ErrorNotFound({ message: err.message });
      } else {
        throw new ErrorDefault('Ошибка по умолчанию.');
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
