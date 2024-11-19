require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');

const cloudwatch = new AWS.CloudWatch();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: console.log, 
});

const checkDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Successfully connected to the Database !!');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

const createDatabase = async () => {
  try {
    console.log("Attempting to create database...");
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log("Database connection successful!");
    await createNewTable();
  } catch (err) {
    console.error("Error while creating the database:", err.message);
    throw new Error(err);
  }
};

const createNewTable = async () => {
  try {
    console.log("Attempting to sync models...");
    await sequelize.sync({ alter: true }); 
    console.log("Models synced successfully!");
  } catch (err) {
    console.error("Failed to sync models:", err.message);
    throw err;
  }
};

// Wrap database operations to measure and log duration
const timedDbQuery = async (operation) => {
  try {
    const start = Date.now();
    const result = await operation();
    const duration = Date.now() - start;

    await cloudwatch.putMetricData({
      MetricData: [
        {
          MetricName: 'DatabaseQueryDuration',
          Dimensions: [{ Name: 'Service', Value: 'Database' }],
          Unit: 'Milliseconds',
          Value: duration,
        },
      ],
      Namespace: 'WebAppMetrics',
    }).promise();

    return result;
  } catch (err) {
    console.error("Error in timed database query:", err);
    throw err;
  }
};

module.exports = { sequelize, checkDbConnection, createDatabase, timedDbQuery };