const Card = require("../models/card");

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === "SomeError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при создании карточки",
        });
      }
      return res.status(500).send({ message: err.message });
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        return res.status(404).send({
          message: "Карточка с указанным _id не найдена.",
        });
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === "SomeError") {
        return res.status(400).send({
          message: "Некорректный id карточки",
        });
      }
      return res.status(500).send({ message: err.message });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then((card) => {
      if (!card) {
        return res.status(404).send({
          message: "Передан несуществующий _id карточки.",
        });
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === "SomeError") {
        return res.status(400).send({
          message: "Переданы некорректные данные для постановки/снятии лайка.",
        });
      }
      return res.status(500).send({ message: err.message });
    });
};

module.exports.deleteLikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .then((card) => {
      if (!card) {
        return res.status(404).send({
          message: "Передан несуществующий _id карточки.",
        });
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === "SomeError") {
        return res.status(400).send({
          message: "Переданы некорректные данные для постановки/снятии лайка.",
        });
      }
      return res.status(500).send({ message: err.message });
    });
};
