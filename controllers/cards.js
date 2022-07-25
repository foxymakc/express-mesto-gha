const Card = require("../models/card");

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: "Ошибка по умолчанию" }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).send({
          message: "Переданы некорректные данные при создании карточки",
        });
      } else {
        return res.status(500).send({ message: "Ошибка по умолчанию" });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
         res.status(404).send({ message: 'Пользователь с таким id не найден' });
      }
       res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).send({
          message: "Карточка с указанным _id не найдена.",
        });
      } else {
        return res.status(500).send({ message: "Ошибка по умолчанию" });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then((likes) => {
      if (!likes) {
         res.status(404).send({ message: 'Пользователь с таким id не найден' });
      }
       res.send({ data: likes });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).send({
          message: "Переданы некорректные данные для постановки/снятии лайка.",
        });
      } else {
        return res.status(500).send({ message: "Ошибка по умолчанию" });
      }
    });
};

module.exports.deleteLikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
  .then((likes) => {
    if (!likes) {
       res.status(404).send({ message: 'Пользователь с таким id не найден' });
    }
     res.send({ data: likes });
  })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).send({
          message: "Переданы некорректные данные для постановки/снятии лайка.",
        });
      } else {
        return res.status(500).send({ message: "Ошибка по умолчанию" });
      }
    });
};
