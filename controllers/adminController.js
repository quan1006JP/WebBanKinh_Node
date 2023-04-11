const Product = require('../models/product');
const Contact = require('../models/contact');
const Order = require('../models/order');


exports.adminPage = async(req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);


        // Tìm các đơn hàng có trạng thái là Pending và được đặt trong ngày hôm nay
        const dayOrders = await Order.find({
            status: 'Pending',
            createdAt: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });



        // Doanh thu tháng hiện tại

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const orders = await Order.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } });




        // Doanh thu tháng trước
        const startOfLastMonth1 = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth1 = new Date(today.getFullYear(), today.getMonth(), 0);
        const ordersLast = await Order.find({ createdAt: { $gte: startOfLastMonth1, $lte: endOfLastMonth1 } })





        // Sản phẩm bán chạy 
        const ord = await Order.find({ status: 'Pending' }); // Lấy ra tất cả các đơn hàng đã hoàn thành
        // Tạo đối tượng để lưu trữ số lượng sản phẩm được bán
        const productCount = {};
        // Đếm số lượng sản phẩm được bán trong các đơn hàng
        ord.forEach(order => {
            Object.values(order.cart.items).forEach(item => {
                if (productCount[item.item._id]) {
                    productCount[item.item._id] += item.qty;
                } else {
                    productCount[item.item._id] = item.qty;
                }
            });
        });
        // Sắp xếp các sản phẩm theo thứ tự giảm dần của số lượng sản phẩm được bán
        const sortedProducts = Object.keys(productCount).sort((a, b) => productCount[b] - productCount[a]);
        // Lấy ra 4 sản phẩm đầu tiên trong danh sách sản phẩm đã được sắp xếp
        const products = await Promise.all(sortedProducts.slice(0, 4).map(productId => Product.findById(productId)));




        // Thông báo 6 liên hệ   
        const contacts = await Contact.find({ status: false }).sort({ createdAt: -1 }).limit(6);




        // Lấy 6 đơn hàng mới nhất
        const newOrders = await Order.aggregate([{
                $match: { status: 'Pending' }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $limit: 5
            }
        ]);





        // thống kê doanh thu 30 ngày gầy đây
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const thongke = await Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%d/%m', date: '$createdAt' } },
                    totalPrice: { $sum: '$cart.totalPrice' },
                    totalProduct: { $sum: '$cart.totalQty' }
                },
            },
            // {
            //     $project: {
            //       _id: 0, // loại bỏ trường _id
            //       totalPrice: 1, // chỉ lấy trường totalPrice
            //     },
            // },
        ]);









        res.render('admin', { thongke, dayOrders, newOrders, products, productCount, contacts, orders, ordersLast, req: req });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};