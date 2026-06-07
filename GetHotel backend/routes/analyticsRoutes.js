const express = require('express');
const { ping } = require('../controllers/analyticsController');

const router = express.Router();

// Public — anyone visiting the site pings this
router.post('/ping', ping);

module.exports = router;
