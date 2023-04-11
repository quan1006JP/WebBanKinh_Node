const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order');



exports.getCart = (req, res) => {
    if (!req.session.cart) {
        return res.render('cart', { products: null });
    }
    const cart = new Cart(req.session.cart);
    const cartProducts = cart.generateArray();
    return res.render('cart', { products: cartProducts, cart: cart });
};


exports.addToCart = async function(req, res) {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    try {
        const product = await Product.findById(productId);
        cart.add(product, product.id);
        req.session.cart = cart;
        return res.redirect('/cart');
    } catch (error) {
        console.error(error);
        return res.redirect('/');
    }
};


exports.reduceByOne = function(req, res) {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    if (cart.totalQty <= 0) {
        delete req.session.cart;
    } else {
        req.session.cart = cart;
    }
    return res.redirect('/cart');
};

exports.removeItem = function(req, res) {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    if (cart.totalQty <= 0) {
        delete req.session.cart;
    } else {
        req.session.cart = cart;
    }
    return res.redirect('/cart');
};


exports.getCheckout = (req, res) => {
    if (!req.session.cart) {
        return res.redirect('/cart');
    } else if (!req.session.user) {
        return res.redirect('/login');
    }
    const paymentMethods = ['Thanh toán khi nhận hàng', 'PayPal', 'VN Pay'];
    const cart = new Cart(req.session.cart);
    const cartProducts = cart.generateArray();
    return res.render('checkout', { products: cartProducts, cart: cart, paymentMethods });
};

exports.postCheckout = async(req, res) => {
    if (!req.session.cart) {
        return res.redirect('/cart');
    }
    const cart = new Cart(req.session.cart);

    const order = new Order({
        user: req.session.user.id,
        cart: cart,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        paymentMethod: req.body.paymentMethod,
        //status: 'Pending'
    });

    try {
        const result = await order.save();
        delete req.session.cart;
        res.locals.message = 'Cảm ơn bạn đã chọn chúng tôi. Chúc bạn có một ngày tuyệt vời!';
        return res.render('thankyou');
    } catch (error) {
        console.error(error);
        return res.redirect('/cart/checkout');
    }
};