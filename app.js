const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const indexRouter = require('./routes/indexRoutes');
const cartRouter = require('./routes/cartRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const orderRouter = require('./routes/orderRoutes');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Import database configuration
const db = require('./config/db');

// Connect to database
mongoose.connect(db.url, db.options)
  .then(() => console.log('Connected to database'))
  .catch((err) => console.error(err));

// Set up session middleware
const mongoStore = new MongoStore({
  mongooseConnection: mongoose.connection,
  collection: 'sessions'
});

app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
  store: mongoStore
}));

// Set up body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set up static files middleware
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes
app.use('/', indexRouter);
app.use('/cart', cartRouter);
app.use('/category', categoryRouter);
app.use('/order', orderRouter);
app.use('/product', productRouter);
app.use('/user', userRouter);

//Bắt đầu một session
app.use((req, res, next) => {
  req.session = req.session || {};
  next();
});
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
