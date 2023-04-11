const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.get('/', contactController.contact);
router.post('/contact/send', contactController.sendMessage);

module.exports = router;