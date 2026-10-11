const express = require('express');

const transactionRoutes =
    require('./routes/transactionRoutes');

const authRoutes = require('./routes/auth');

const notFound =
    require('./middleware/notFound');

const errorHandler =
    require('./middleware/errorHandler');


const app = express();

app.use(express.json());

app.use('/auth', authRoutes);



app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Financial Analytics API',
        version: '1.0.0'
    });
});


app.use(
    '/api/transactions',
    transactionRoutes
);


app.use(notFound);


app.use(errorHandler);


module.exports = app;