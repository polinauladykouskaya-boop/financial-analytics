const express = require('express');
const cors = require('cors');

const transactionRoutes =
    require('./routes/transactionRoutes');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Financial Analytics MongoDB API',
        version: '1.0.0',
        database: 'MongoDB'
    });
});

app.use(
    '/api/transactions',
    transactionRoutes
);

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

app.use((error, req, res, next) => {
    console.error(error);

    if (error.name === 'ValidationError') {
        return res.status(400).json({
            error: error.message
        });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid ID or field value'
        });
    }

    if (error.name === 'StrictModeError') {
        return res.status(400).json({
            error: error.message
        });
    }

    res.status(500).json({
        error: 'Internal server error'
    });
});

module.exports = app;