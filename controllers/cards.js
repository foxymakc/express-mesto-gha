const Card = require('../models/card');
const { ERROR_BAD_REQUEST, ERROR_NOT_FOUND, ERROR_DEFAULT } = require('../errors/errors');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию' }));
};

const createCard = (req, res) => {
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
    });
};

const deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(() => res.status(ERROR_NOT_FOUND).send({ message: 'Карточка не найдена' }))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'IncorrectDetaError' || err.name === 'CastError') {
        res.status(ERROR_BAD_REQUEST).send({
          message: 'Переданы некорректные данные',
        });
      } else {
        res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию' });
      }
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => res.status(ERROR_NOT_FOUND).send({ message: 'Карточка не найдена' }))
    .then((likes) => res.send({ data: likes }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_BAD_REQUEST).send({
          message: 'Переданы некорректные данные для постановки/снятии лайка.',
        });
      } else {
        res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию' });
      }
    });
};

const deleteLikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => res.status(ERROR_NOT_FOUND).send({ message: 'Карточка не найдена' }))
    .then((likes) => res.send({ data: likes }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_BAD_REQUEST).send({
          message: 'Переданы некорректные данные для постановки/снятии лайка.',
        });
      } else {
        res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию' });
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  deleteLikeCard,
};
