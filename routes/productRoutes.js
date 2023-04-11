const express = require('express');
const router = express.Router();
const multer = require('multer');
const bodyParser = require('body-parser');
const app = express();
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController');


router.get('/search', productController.searchProduct);

router.get('/category/:id', productController.getProductByCategory);

router.get('/', productController.getAllProducts);

router.get('/:id', productController.getProductById);

router.post('/', productController.createProduct);

router.put('/:id', productController.updateProductById);

router.delete('/:id', productController.deleteProductById);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
router.post('/cart/:id', cartController.addToCart);

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './image_product');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), productController.createProduct);




module.exports = router;