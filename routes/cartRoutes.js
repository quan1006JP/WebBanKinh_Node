const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.post('/add/:id', cartController.addToCart);
router.get('/', cartController.getCart);

router.post('/reduce/:id', cartController.reduceByOne);
router.post('/remove/:id', cartController.removeItem);

router.get('/checkout', cartController.getCheckout);
router.post('/checkout/order', cartController.postCheckout);




module.exports = router;