require('dotenv').config();
const { Sequelize } = require('sequelize');

// Initialize Sequelize with values from .env

console.log("DB_DIALECT:", process.env.DB_DIALECT);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
});

// Function to test the database connection
const checkDbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Successfully connected to the Database !!');
        return true;
    } catch (error) {
        console.error('Database connection failed :', error);
        return false;
    }
};

module.exports = { sequelize, checkDbConnection };
