const Review = require('../models/review');

exports.postReview = async(req, res) => {
    try {
        const product = req.params.id;
        user = req.session.user.id;
        const comment = req.body.comment;
        const review = new Review({
            product: product,
            user: user,
            comment: comment,
        });
        await review.save();
        res.redirect('/product/' + product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};