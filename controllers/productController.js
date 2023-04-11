const Product = require('../models/product');
const Category = require('../models/category');
const Review = require('../models/review');
const mongoose = require('mongoose');
const PAGE_SIZE = 12;

exports.getCreateProductPage = async(req, res) => {
    const categories = await Category.find(); // lấy danh mục sản phẩm
    const products = await Product.find().select('_id name description price image');
    res.render('product-create', { categories: categories, req });
};

exports.createProduct = async(req, res, next) => {
    const { name, description, price, image, category } = req.body;
    const product = new Product({
        name: name,
        description: description,
        price: price,
        image: image,
        category: category
    });
    const categories = await Category.find(); // lấy danh mục sản phẩm
    const products = await Product.find().select('_id name description price image');
    product.save()
        .then(result => {
            console.log('Created Product');
            res.render('product-create', { categories: categories });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};


exports.getAllProducts = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Lấy trang hiện tại từ query params, mặc định là trang đầu tiên (page = 1)
        const categories = await Category.find(); // lấy danh mục sản phẩm
        const count = await Product.countDocuments(); // Lấy tổng số sản phẩm
        const { products, totalPages } = await getAllProductsPaginated(page, PAGE_SIZE);
        // Lấy danh sách sản phẩm với phân trang
        res.render('shop', {
            categories: categories,
            products: products,
            currentPage: page,
            totalPages: totalPages,
            req
        }); // truyền dữ liệu vào view và thông tin phân trang
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getAllProductsPaginated = async(page, pageSize) => {
    const products = await Product.find()
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .select('_id name description price image');
    const count = await Product.countDocuments();
    const totalPages = Math.ceil(count / pageSize); // Tính tổng số trang dựa trên số sản phẩm và PAGE_SIZE
    return { products, totalPages };
};


exports.getAllProductsAdmin = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Lấy trang hiện tại từ query params, mặc định là trang đầu tiên (page = 1)
        const categories = await Category.find(); // lấy danh mục sản phẩm
        const count = await Product.countDocuments(); // Lấy tổng số sản phẩm
        const { products, totalPages } = await getAllProductsPaginated(page, PAGE_SIZE);
        // Lấy danh sách sản phẩm với phân trang
        res.render('product-list', {
            categories: categories,
            products: products,
            currentPage: page,
            totalPages: totalPages,
            count: count,
            req
        }); // truyền dữ liệu vào view và thông tin phân trang
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


exports.getProductById = async(req, res) => {
    const id = req.params.id;

    try {
        const product = await Product.findById(id).populate('category');
        const reviews = await Review.find({ product: id }).populate('user');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const relatedProducts = await Product.find({ category: product.category, _id: { $ne: id } }).limit(4);

        res.render('product', { product, relatedProducts, reviews, req });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

exports.updatePage = async(req, res) => {
    try {
        const categories = await Category.find(); // lấy danh mục sản phẩm
        const id = req.params.id;
        const product = await Product.findById(id).select('_id name description price image');
        res.render('product-edit', { categories: categories, product: product, req }); // truyền dữ liệu vào view
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
exports.updateProductById = (req, res, next) => {
    const id = req.params.id;
    const { name, description, price, image, category } = req.body;
    Product.findByIdAndUpdate(id, { name, description, price, image, category }, { new: true })
        .then(product => {
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.redirect('/admin/list-product');
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.deleteProductById = async(req, res, next) => {
    const id = req.params.id;
    const products = await Product.find().select('_id name description price image');
    Product.findByIdAndRemove(id)
        .then(product => {
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.redirect('/admin/list-product');
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.indexProduct = async(req, res) => {
    try {
        const newProducts = await Product.find().sort({ _id: -1 }).limit(4);
        const firstProducts = await Product.find().sort({ _id: 1 }).limit(4);

        res.render('index', { newProducts, firstProducts });
    } catch (err) {
        console.error(err);
    }
};


exports.searchProduct = async(req, res, next) => {
    try {
        const categories = await Category.find(); // lấy danh mục sản phẩm
        const searchQuery = req.query.q;
        const regex = new RegExp(searchQuery, 'i');
        const products = await Product.find({ name: regex });

        if (products.length === 0) {
            const products = [];
            return res.render('product-search', { products, message: 'Không tìm thấy thấy sản phẩm ', categories, searchQuery });
        } else {
            res.render('product-search', { products, categories, searchQuery, req });
        }
    } catch (error) {
        next(error);
    }
};


exports.getProductByCategory = async(req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);
        const products = await Product.find({ category: categoryId });
        const categories = await Category.find();

        res.render('product-category', { categories, products, req });
    } catch (error) {
        next(error);
    }
};