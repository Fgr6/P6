const express = require('express');
const router = express.Router();
const validEmail = require('../middleware/valid');
const userCtrl = require('../controllers/user');

router.post('/signup', validEmail, userCtrl.signup);

router.post('/login', userCtrl.login);

module.exports = router;