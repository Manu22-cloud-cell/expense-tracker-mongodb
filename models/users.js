const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db-connection');

const Users = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isPremium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    totalExpense: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false
    }
});

module.exports = Users;