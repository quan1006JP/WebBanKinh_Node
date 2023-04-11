const Order = require('../models/order');



// GET all orders
exports.getAllOrders = async(req, res, next) => {
    try {
        const orders = await Order.find();
        res.render('order-list', { orders: orders, req });
    } catch (err) {
        next(err);
    }
};

// GET a single order by ID
exports.getOrderById = async(req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                status: 'fail',
                message: 'Order not found'
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }
};

// POST a new order
exports.createOrder = async(req, res, next) => {
    try {
        const order = await Order.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }
};

// PATCH an existing order by ID
exports.updateOrder = async(req, res, next) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!order) {
            return res.status(404).json({
                status: 'fail',
                message: 'Order not found'
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }
};

// DELETE an existing order by ID
exports.deleteOrder = async(req, res, next) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({
                status: 'fail',
                message: 'Order not found'
            });
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }
};