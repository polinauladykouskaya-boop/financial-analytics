
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },

        passwordHash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        resetPasswordToken: {
            type: DataTypes.STRING(64),
            allowNull: true
        },

        resetPasswordExpires: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        tableName: 'users',
        timestamps: true
    }
);

module.exports = User;
