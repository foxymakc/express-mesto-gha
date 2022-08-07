const router = require('express').Router();
const {
  getCards, createCard, deleteCard, likeCard, deleteLikeCard,
} = require('../controllers/cards');
const {
  idValidation, createCardValidation,
} = require('../middlewares/validation');

router.get('/cards', getCards);
router.post('/cards', createCardValidation, createCard);
router.delete('/cards/:cardId', idValidation, deleteCard);
router.put('/cards/:cardId/likes', idValidation, likeCard);
router.delete('/cards/:cardId/likes', idValidation, deleteLikeCard);

module.exports = router;
