const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { secret } = require('../config/config.json');
const User = require('../models/user');
const Order = require('../models/order');
const Review = require('../models/review');




// Controller for handling user creation
exports.createUser = async(req, res, next) => {
    try {
        const { name, email, password, isAdmin } = req.body;
        const user = new User({
            name,
            email,
            password,
            isAdmin
        });
        await user.save();
        res.status(201).json({ message: 'User created successfully!', user });
    } catch (err) {
        next(err);
    }
};

// Controller for getting all users
exports.getAllUsers = async(req, res, next) => {
    try {
        const users = await User.find();
        res.render('user-list', { users: users, req });
    } catch (err) {
        next(err);
    }
};

// Controller for getting a user by ID
exports.getUserById = async(req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};
exports.updatePage = async(req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        res.render('user-edit', { user: user, req }); // truyền dữ liệu vào view
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
// Controller for updating a user by ID
exports.updateUserById = async(req, res, next) => {
    try {
        const { name, email, image, phone, address } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, {
            name,
            email,
            image,
            phone,
            address
        });
        if (!user) {
            return res.redirect('/user/setting/' + req.params.id);
        }
        res.redirect('/user/setting/' + req.params.id);
    } catch (err) {
        next(err);
    }
};

// Controller for deleting a user by ID
exports.deleteUserById = async(req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.redirect('/admin/list-user');
    } catch (err) {
        next(err);
    }
};

//form register
exports.registerPage = async(req, res) => {
    res.render('register');
};
// Controller for handling user registration
exports.register = async(req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Kiểm tra email đã tồn tại trong database hay chưa
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ message: 'Email already exists.' });
        }

        // Mã hóa mật khẩu bằng bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();
        res.render('login');
    } catch (err) {
        next(err);
    }
};


exports.loginPage = async(req, res) => {
    res.render('login');
};

exports.checkLogin = async(req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra email và password
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Tìm người dùng theo email
        const user = await User.findOne({ email });
        if (!user) {
            res.locals.message = 'Email hoặc mật khẩu không chính xác!';
            return res.render('login');
        }

        // Kiểm tra mật khẩu
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.locals.message = 'Email hoặc mật khẩu không chính xác!';
            return res.render('login');
        }

        // Tạo JWT token
        const token = jwt.sign({ userId: user._id }, secret);

        // Phân quyền người dùng
        let role = 'user'; // Mặc định là user
        if (user.isAdmin) {
            role = 'admin'; // Nếu là admin thì gán role là admin
        }

        // Lưu role vào cookie
        res.cookie('role', role, { httpOnly: true });
        // Lưu thông tin người dùng vào session
        req.session.user = { id: user._id, name: user.name, email: user.email, role, image: user.image };

        // Chuyển hướng người dùng đến trang chủ hoặc trang quản trị tùy vào role
        if (role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.logout = (req, res) => {
    // Xóa cookie lưu trữ thông tin phân quyền
    res.clearCookie('role');
    // Xóa session user
    delete req.session.user;
    // Xóa toàn bộ session
    // req.session.destroy((err) => {
    //   if (err) {
    //     console.error(err);
    //   }
    //});
    // Chuyển hướng người dùng đến trang đăng nhập
    res.redirect('/login');
};


// Controller for getting user profile
exports.admin = async(req, res, next) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        res.render('user-admin', { user: user, req }); // truyền dữ liệu vào view
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};





exports.forgotPasswordPage = async(req, res) => {
    res.render('forgot-password');
};



const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

exports.forgotPassword = async(req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.locals.message = 'Email không tồn tại!';
            res.render('forgot-password');
        } else {
            // Tạo mã xác thực ngẫu nhiên
            const token = randomstring.generate(6);
            user.resetPasswordToken = token;
            const now = new Date();
            const expires = new Date(now.getTime() + 3600 * 1000); // Thời gian hiện tại + 1 giờ
            user.resetPasswordExpires = expires; // Thời gian hết hạn của mã là 1 giờ
            await user.save();
            // Gửi email chứa mã xác thực
            const transporter = nodemailer.createTransport({
                host: 'smtp.elasticemail.com',
                port: 2525,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'hqmteams@gmail.com', // replace with your Elastic Email username
                    pass: '5096F6B467FA7F4B9F284CE4E75F899C0DC8', // replace with your Elastic Email password
                },
            });

            const mailOptions = {
                to: email,
                from: 'hqmteams@gmail.com',
                subject: 'HQM teams',
                text: `HQM teams nhận được yêu cầu thay đổi mật khẩu từ tài khoản của bạn.\n
        Mã xác nhận thay đổi mật khẩu: "${token}"\n
        Lưu ý :\n
        - Mã xác thực chỉ có tác dụng trong 5 phút.\n
        - Nếu không phải bạn yêu cầu đổi mật khẩu xin hãy bỏ qua email này.\n`
            };

            await transporter.sendMail(mailOptions);

            res.render('reset-password');
        }

    } catch (err) {
        next(err);
    }
};



exports.changePassword = async(req, res, next) => {
    try {
        const { email, token, newPassword1, newPassword2 } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.locals.message = 'Email không chính xác!';
            return res.render('reset-password');
        } else if (newPassword1 !== newPassword2) {
            res.locals.message = 'Mật khẩu không khớp!';
            return res.render('reset-password');
        } else if (token !== user.resetPasswordToken || Date.now() > user.resetPasswordExpires) {
            res.locals.message = 'Mã xác thực không đúng hoặc hết thời gian!';
            return res.render('reset-password');
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword1, salt);

        user.password = hash;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.redirect('/login');

    } catch (err) {
        next(err);
    }
};

exports.user = async(req, res, next) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        const orders = await Order.find({ user: id });
        const reviews = await Review.find({ user: id }).populate('user').populate('product');
        const countPending = await Order.countDocuments({ user: id, status: "Pending" });
        const countProcessing = await Order.countDocuments({ user: id, status: "Processing" });
        const countShipped = await Order.countDocuments({ user: id, status: "Shipped" });
        const countDelivery = await Order.countDocuments({ user: id, status: "Delivery" });
        const countCompleted = await Order.countDocuments({ user: id, status: "Completed" });


        if (!user) {
            return res.redirect('/login');
        }
        res.render('user', { user, orders, reviews, countPending, countProcessing, countShipped, countDelivery, countCompleted });
    } catch (err) {
        next(err);
    }
};

exports.userSetting = async(req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.redirect('/login');
        }
        res.render('user-setting', { user });
    } catch (err) {
        next(err);
    }
};


exports.updateUserbyAdmin = async(req, res, next) => {
    try {
        const { name, email, isAdmin } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, {
            name,
            email,
            isAdmin
        });
        if (!user) {
            return res.redirect('/admin/list-user');
        }
        res.redirect('/admin/list-user');
    } catch (err) {
        next(err);
    }
};


exports.admin = async(req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.redirect('/login');
        }
        res.render('admin-profile', { user });
    } catch (err) {
        next(err);
    }
};

exports.adminSetting = async(req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.redirect('/login');
        }
        res.render('admin-setting', { user });
    } catch (err) {
        next(err);
    }
};


exports.updateAdminById = async(req, res, next) => {
    try {
        const { name, email, image, phone, address } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, {
            name,
            email,
            image,
            phone,
            address
        });
        if (!user) {
            return res.redirect('/admin/setting/' + req.params.id);
        }
        res.redirect('/admin/setting/' + req.params.id);
    } catch (err) {
        next(err);
    }
};