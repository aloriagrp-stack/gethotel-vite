const express = require('express');
const { getHomepageConfig } = require('../controllers/homepageController');

const router = express.Router();

// Public — frontend fetches homepage config
router.get('/config', getHomepageConfig);

module.exports = router;
