require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
});

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

const createDatabase = async () => {
    try {
      const newConnection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });
  
      await newConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
      console.log("Database connection successful!");
      await createNewTable();
    } catch (err) {
      console.error("Error while creating the database:", err.message);
      throw new Error(err);
    }
  };


const createNewTable = async () => {
    try {
      await sequelize.sync({ alter: true }); 
      console.log("Models synched successfully!");
    } catch (err) {
      console.error("Failed to Sync Models:", err.message);
    }
  };


module.exports = { sequelize, checkDbConnection, createDatabase };
