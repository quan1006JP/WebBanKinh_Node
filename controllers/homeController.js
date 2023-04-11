const Product = require('../models/product');
const mongoose = require('mongoose');


exports.getHomePage = async(req, res) => {
    try {
        const newProducts = await Product.find().sort({ _id: -1 }).limit(8);
        const firstProducts = await Product.find().sort({ _id: 1 }).limit(4);

        res.render('index', { newProducts, firstProducts, req: req });
    } catch (err) {
        console.error(err);
    }
};


exports.thankyou = async(req, res) => {
    try {
        res.render('thankyou');
    } catch (err) {
        console.error(err);
    }
};