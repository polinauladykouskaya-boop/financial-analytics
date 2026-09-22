const { DataTypes } = require('sequelize');

const sequelize =
    require('../config/database');


const Transaction = sequelize.define(
    'Transaction',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        type: {
            type: DataTypes.ENUM(
                'INCOME',
                'EXPENSE'
            ),
            allowNull: false
        },

        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },

        category: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        paymentMethod: {
            type: DataTypes.STRING(30),
            allowNull: true
        },

        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
    },
    {
        tableName: 'transactions',
        timestamps: false
    }
);


module.exports = Transaction;