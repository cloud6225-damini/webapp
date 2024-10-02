const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const validator = require('validator');


const encodedPass = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const isEmailValid = (email) => {
  return validator.isEmail(email);
};

const createUser = async (req) => {

  if (!req.is('application/json')) {
    throw new Error('Please provide valid json format!');
  }

  const { first_name, last_name, email, password, ...extraFields } = req.body;

  if (!first_name || !last_name || !password || !email || 
    Object.keys(extraFields).length > 0) {
    throw new Error("Please provide valid request body!");
  }

  if (!isEmailValid(email)) {
    throw new Error('Please provide valid email !');
  }

  if (typeof first_name !== 'string' || typeof last_name !== 'string' 
    || typeof password !== 'string') {
      throw new Error("Please provide Name and Password as a String!");
  }
  
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Email id already created !');
  }

  const hashedPassword = await encodedPass(password);
  return User.create({
    first_name,
    last_name,
    email,
    password: hashedPassword,
  });
};

const getUserByEmail = async (email) => {
  return User.findOne( {where: { email } });
};


const updateUserInfo = async (email, req) => {

    if (!req.is('application/json')) {
      throw new Error('Please provide Request body in JSON format!');
    }

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      throw new Error('User not found !!');
    }
  
    const { first_name, last_name, password, ...extraFields } = req.body;

    if (Object.keys(extraFields).length > 0) {
      throw new Error('Cannot update fields other than firstname, lastname or password !');
    }

    if ( (first_name && typeof first_name !== 'string') || 
    (last_name && typeof last_name !== 'string') || 
    (password && typeof password !== 'string')) {
      throw new Error('Name and Password must be String !');
    }
  
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (password) user.password = await encodedPass(password);

    user.account_updated = new Date();
  
    return user.save();
  };
  

const getUser = async (id) => {
  return User.findByPk(id, {
    attributes: ['first_name', 'last_name', 'email', 'account_created', 'account_updated'],
  });
};

module.exports = {
  createUser,
  getUserByEmail,
  updateUserInfo,
  getUser
};
