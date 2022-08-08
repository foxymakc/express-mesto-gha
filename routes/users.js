const router = require('express').Router();
const {
  getUsers, getUserId, updateUser, updateAvatar, getInfoUser,
} = require('../controllers/users');
const {
  idValidation, updateUserValidation, updateAvatarValidation,
} = require('../middlewares/validation');

router.get('/users', getUsers);
router.get('/users/:userId', idValidation, getUserId);
router.get('/users/me', idValidation, getInfoUser);
router.patch('/users/me', updateUserValidation, updateUser);
router.patch('/users/me/avatar', updateAvatarValidation, updateAvatar);

module.exports = router;
