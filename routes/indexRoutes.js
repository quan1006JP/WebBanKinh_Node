const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const userController = require('../controllers/userController');
const contactController = require('../controllers/contactController');
const reviewController = require('../controllers/reviewController');




const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const productRoutes = require('./productRoutes');
const userRoutes = require('./userRoutes');
const contactRoutes = require('./contactRoutes');
const aboutRoutes = require('./aboutRoutes');
const adminRoutes = require('./adminRoutes');







router.get('/', homeController.getHomePage);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);
router.use('/user', userRoutes);
router.use('/contact', contactRoutes);
router.post('/contact/send', contactController.sendMessage);
router.use('/about', aboutRoutes);
router.use('/admin', adminRoutes);
router.use('/login', userRoutes);
router.get('/register', userController.registerPage);
router.post('/register/add', userController.register);
router.get('/logout', userController.logout);
router.get('/forgot-password', userController.forgotPasswordPage);
router.post('/forgot-password/resetpass', userController.forgotPassword);
router.post('/forgot-password/resetpass/save', userController.changePassword);
router.post('/product/:id', reviewController.postReview);
router.get('/thankyou', homeController.thankyou);

module.exports = router;