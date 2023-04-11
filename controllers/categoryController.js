const category = require('../models/category');
const Category = require('../models/category');

exports.getCreateCategory = async(req, res) => {
    res.render('category-create');
};

exports.createCategory = async(req, res, next) => {
    const { name, description } = req.body;
    const category = new Category({
        name: name,
        description: description,
    });
    category.save()
        .then(result => {
            console.log('Created Product');
            res.render('category-create');
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.getAllCategories = (req, res, next) => {
    Category.find()
        .then(categories => {
            res.render('category-list', { categories: categories, req });
        })
        .catch(error => {
            res.status(500).json({
                message: 'Fetching categories failed!'
            });
        });
};

exports.getCategoryById = (req, res, next) => {
    Category.findById(req.params.categoryId)
        .then(category => {
            if (category) {
                res.status(200).json(category);
            } else {
                res.status(404).json({
                    message: 'Category not found'
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: 'Fetching category failed!'
            });
        });
};
exports.updatePage = async(req, res) => {
    try {
        const id = req.params.id;
        const category = await Category.findById(id).select('_id name description');
        res.render('category-edit', { category: category, req }); // truyền dữ liệu vào view
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
exports.updateCategoryById = (req, res, next) => {
    const id = req.params.id;
    const { name, description } = req.body;
    Category.findByIdAndUpdate(id, { name, description }, { new: true })
        .then(category => {
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.redirect('/admin/list-category');
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.deleteCategoryById = async(req, res, next) => {
    const id = req.params.id;
    const category = await Category.find().select('_id name description');
    Category.findByIdAndRemove(id)
        .then(category => {
            if (!category) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.redirect('/admin/list-category');
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};