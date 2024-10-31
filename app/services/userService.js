const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const ProfilePic = require('../models/profilePicModel');
const validator = require('validator');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { v4: uuidv4 } = require('uuid');


const encodedPass = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const isEmailValid = (email) => {
  return validator.isEmail(email);
};

const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
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
  if (!isValidPassword(password)) {
    throw new Error('Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
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


const uploadProfilePic = async (userId, file) => {
  // Check if the user already has a profile picture
  const existingProfilePic = await ProfilePic.findOne({ where: { userId } });

  if (existingProfilePic) {
    // If a profile picture already exists, throw an error
    throw new Error('User already has a profile picture. Please delete the existing image before uploading a new one.');
  }

  // Generate a new file ID and S3 key
  const fileId = uuidv4();
  const s3Key = `${userId}/${fileId}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  // Upload the new profile picture to S3
  await s3.upload(params).promise();

  // Save metadata to ProfilePic model
  const profilePic = await ProfilePic.create({
    id: fileId,
    fileName: file.originalname,
    s3Key: s3Key,
    uploadDate: new Date(),
    userId: userId
  });

  return {
    file_name: profilePic.fileName,
    id: profilePic.id,
    url: profilePic.s3Key,
    upload_date: profilePic.uploadDate,
    user_id: profilePic.userId
  };
};


const getProfilePic = async (userId) => {
  const profilePic = await ProfilePic.findOne({ where: { userId } });

  if (!profilePic) {
    return null;
  }

  const response = {
    file_name: profilePic.fileName,
    id: profilePic.id,
    url: profilePic.s3Key, 
    upload_date: profilePic.uploadDate,
    user_id: profilePic.userId,
  };

  return response;
};


const deleteProfilePic = async (userId) => {
  const profilePic = await ProfilePic.findOne({ where: { userId } });

  if (!profilePic) {
    throw new Error('Profile picture not found'); 
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: profilePic.s3Key,
  };
  await s3.deleteObject(params).promise();
  await ProfilePic.destroy({ where: { userId } });
};


module.exports = {
  createUser,
  getUserByEmail,
  updateUserInfo,
  getUser,
  uploadProfilePic,
  getProfilePic,
  deleteProfilePic,
};