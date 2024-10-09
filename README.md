# Cloud-Native Web Application

This repository contains a cloud-native web application developed using Node.js, Sequelize, and MySQL. The application provides a RESTful API with a `/healthz` endpoint to check the database connectivity.

## Prerequisites

- **Operating System**: macOS
- **Programming Language**: Node.js 
- **Database**: MySQL
- **Node Package Manager**: npm 
- **ORM Framework:**: Sequelize (for Node.js)


## Create a database 
mysql -u root -p
CREATE DATABASE your_db_name;

## Create a .env file with the following details:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=your_db_name
DB_PORT=3306
PORT=3000

## Install dependencies

npm install


## Run the application

- Change directory inside /app
- node server.js