const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAdmin } = require('../middlewares');
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const userController = require('../controllers/userController');
const contactController = require('../controllers/contactController');
const orderController = require('../controllers/orderController');



router.get('/logout', userController.logout);

router.get('/', requireAdmin, adminController.adminPage);


router.get('/list-user', requireAdmin, userController.getAllUsers);
router.get('/admin-profile', requireAdmin, userController.admin);
router.get('/edit-user/:id', requireAdmin, userController.updatePage);
router.post('/edit-user/:id', requireAdmin, userController.updateUserbyAdmin);
router.post('/delete-user/:id', requireAdmin, userController.deleteUserById);

router.get('/list-product', requireAdmin, productController.getAllProductsAdmin);
router.get('/create-product', requireAdmin, productController.getCreateProductPage);
router.post('/create-product', requireAdmin, productController.createProduct);
router.get('/edit-product/:id', requireAdmin, productController.updatePage);
router.post('/edit-product/:id', requireAdmin, productController.updateProductById);
router.post('/delete-product/:id', requireAdmin, productController.deleteProductById);

router.get('/list-category', requireAdmin, categoryController.getAllCategories);
router.get('/create-category', requireAdmin, categoryController.getCreateCategory);
router.post('/create-category', requireAdmin, categoryController.createCategory);
router.get('/edit-category/:id', requireAdmin, categoryController.updatePage);
router.post('/edit-category/:id', requireAdmin, categoryController.updateCategoryById);
router.post('/delete-category/:id', requireAdmin, categoryController.deleteCategoryById);

router.get('/list-contact', requireAdmin, contactController.getAllContacts);
router.get('/message-contact/:id', requireAdmin, contactController.getContactById);
router.post('/delete-contact/:id', requireAdmin, contactController.deleteContactById);


router.get('/profile/:id', requireAdmin, userController.admin);
router.get('/setting/:id', requireAdmin, userController.adminSetting);
router.post('/upload/:id', requireAdmin, userController.updateAdminById);

router.get('/order', requireAdmin, orderController.getAllOrders);



const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/image_product');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), productController.createProduct);


module.exports = router;