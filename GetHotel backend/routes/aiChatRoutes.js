const express = require('express');
const { chat } = require('../controllers/aiController');

const router = express.Router();

router.route('/chat').post(chat);

module.exports = router;
