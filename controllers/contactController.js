const Contact = require('../models/contact');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

exports.contact = (req, res, next) => {
    res.render('contact', { req });
};


exports.sendMessage = async(req, res, next) => {
    const { name, email, address, phone, message } = req.body;
    const contact = new Contact({
        name: name,
        email: email,
        address: address,
        phone: phone,
        message: message
    });
    contact.save()
        .then(async(result) => {
            // create transporter
            let transporter = nodemailer.createTransport({
                host: "smtp.elasticemail.com",
                port: 587,
                secure: false, // upgrade later with STARTTLS
                auth: {
                    user: "thuanphat.helper@gmail.com",
                    pass: "A7ECE53AF586699D4FDDEDDE84FD0AB511FD",
                },
            });
            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '"thuanphat.helper@gmail.com" <thuanphat.helper@gmail.com>', // sender address
                to: "maymocthanphat@gmail.com", // list of receivers
                subject: "MÁY MÓC THUẬN PHÁT", // Subject line
                html: `Họ và tên khách hàng : ${name} <br> Địa chỉ email : ${email} <br> Địa chỉ : ${address} <br> Số điện thoại : ${phone} <br> Nội dung tin nhắn : <br>"${message}"`, // html body
            });
            res.locals.message = 'Cảm ơn bạn đã chọn chúng tôi. Chúc bạn có một ngày tuyệt vời!';
            res.render('thankyou');
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};


exports.getAllContacts = async(req, res) => {
    try {
        const contacts = await Contact.find()
        res.render('contact-list', { contacts: contacts, req }); // truyền dữ liệu vào view
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.getContactById = async(req, res, next) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found.' });
        }
        res.render('contact-message', { req, contact });
    } catch (err) {
        next(err);
    }
};

exports.deleteContactById = async(req, res, next) => {
    const id = req.params.id;
    const contacts = await Contact.find();
    Contact.findByIdAndRemove(id)
        .then(contact => {
            if (!contact) {
                return res.status(404).json({ message: 'Contact not found' });
            }
            res.redirect('/admin/list-contact');
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};