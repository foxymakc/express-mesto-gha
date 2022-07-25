const User = require("../models/user");

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: "Ошибка по умолчанию." }));
};

module.exports.getUserId = (req, res) => {
  User.findById(req.params.userId)
    .then((userId) => res.send({ data: userId }))
    .catch((err) => {
      if (err.name === "SomeError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при создании пользователя",
        });
      }
      return res.status(500).send({ message: "Ошибка по умолчанию." });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === "SomeError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при создании пользователя.",
        });
      } else {
        return res.status(500).send({ message: "Ошибка по умолчанию." });
      }
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about })
    .orFail(() => res.status(404).send({ message: 'Пользователь с таким id не найден' }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === "SomeError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при обновлении профиля.",
        });
      } else {
        return res.status(500).send({ message: "Ошибка по умолчанию." });
      }
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar })
    .orFail(() => res.status(404).send({ message: 'Пользователь с таким id не найден' }))
    .then((avatarData) => res.send({ data: avatarData }))
    .catch((err) => {
      if (err.name === "SomeError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при обновлении аватара.",
        });
      } else {
        return res.status(500).send({ message: "Ошибка по умолчанию." });
      }
    });
};
