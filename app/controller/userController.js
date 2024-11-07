const {
  createUser,
  getUser,
  updateUserInfo,
  uploadProfilePic,
  getProfilePic,
  deleteProfilePic,
} = require('../services/userService');
const logger = require('../middleware/logger'); // Winston Logger
const { recordApiTime, incrementApiCount } = require('../middleware/metricsServer'); // Metrics

const createUserController = async (req, res) => {
  const startTime = Date.now();
  incrementApiCount('createUser');

  try {
    if (Object.keys(req.query).length > 0 || req.url.includes('?')) {
      logger.warn('Query parameters are not allowed in the URL for createUser');
      return res.status(400).json({ message: 'Query parameters are not allowed in the URL.' });
    }
    if (req.headers.authorization) {
      logger.warn('Authorization header should not be provided for createUser');
      return res.status(400).json({ message: 'Authorization should not be provided for this request.' });
    }
    
    const user = await createUser(req);
    const { id, first_name, last_name, email, account_created, account_updated } = user;

    logger.info('User created successfully', { id, email });
    recordApiTime('createUser', startTime);

    res.status(201).json({ first_name, last_name, email, account_created, account_updated });
  } catch (error) {
    logger.error(`Error in createUser: ${error.message}`);
    recordApiTime('createUser', startTime);
    res.status(400).json({ message: error.message });
  }
};

const getUserController = async (req, res) => {
  const startTime = Date.now();
  incrementApiCount('getUser');

  try {
    if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) {
      logger.warn('Payload or query parameters not allowed for getUser');
      return res.status(400).json({ message: "No payload should be given in GET request!" });
    }

    const user = await getUser(req.user.id);

    logger.info('User retrieved successfully', { id: req.user.id });
    recordApiTime('getUser', startTime);

    res.status(200).json(user);
  } catch (error) {
    logger.error(`Error in getUser: ${error.message}`);
    recordApiTime('getUser', startTime);
    res.status(400).json({ message: error.message });
  }
};

const updateUserController = async (req, res) => {
  const startTime = Date.now();
  incrementApiCount('updateUser');

  try {
    if (Object.keys(req.query).length > 0 || req.url.includes('?')) {
      logger.warn('Query parameters are not allowed in updateUser');
      return res.status(400).json({ message: 'Query parameters not allowed !!' });
    }

    await updateUserInfo(req.user.email, req);

    logger.info('User info updated successfully', { email: req.user.email });
    recordApiTime('updateUser', startTime);

    res.status(204).json({ message: "User Info Updated!" });
  } catch (error) {
    logger.error(`Error in updateUser: ${error.message}`);
    recordApiTime('updateUser', startTime);
    res.status(400).json({ message: error.message });
  }
};

const uploadProfilePicController = async (req, res) => {
  const startTime = Date.now();
  incrementApiCount('uploadProfilePic');

  try {
    if (!req.file) {
      logger.warn('No file uploaded for uploadProfilePic');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const existingPic = await getProfilePic(req.user.id);
    if (existingPic) {
      logger.warn('User already has a profile picture, deletion required before uploading a new one');
      return res.status(400).json({ message: 'User already has a profile picture. Please delete the existing image before uploading a new one.' });
    }

    const picData = await uploadProfilePic(req.user.id, req.file);

    logger.info('Profile picture uploaded successfully', { userId: req.user.id });
    recordApiTime('uploadProfilePic', startTime);

    res.status(201).json(picData);
  } catch (error) {
    logger.error(`Error in uploadProfilePic: ${error.message}`);
    recordApiTime('uploadProfilePic', startTime);
    res.status(400).json({ message: error.message });
  }
};

const getProfilePicController = async (req, res) => {
  const startTime = Date.now();
  incrementApiCount('getProfilePic');

  try {
    const userId = req.user.id;
    const profilePicData = await getProfilePic(userId);

    // Check if profile picture data is null or undefined
    if (!profilePicData) {
      logger.warn(`Profile picture not found for user: ${userId}`);
      recordApiTime('getProfilePic', startTime);
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    logger.info('Profile picture retrieved successfully', { userId });
    recordApiTime('getProfilePic', startTime);

    res.status(200).json(profilePicData);
  } catch (error) {
    logger.error(`Error retrieving profile picture: ${error.message}`);
    recordApiTime('getProfilePic', startTime);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const deleteProfilePicController = async (req, res) => {
  const startTime = Date.now();
  incrementApiCount('deleteProfilePic');

  try {
    const userId = req.user.id;

    await deleteProfilePic(userId);

    logger.info('Profile picture deleted successfully', { userId });
    recordApiTime('deleteProfilePic', startTime);

    res.status(204).send();
  } catch (error) {
    logger.error(`Error in deleteProfilePic: ${error.message}`);
    recordApiTime('deleteProfilePic', startTime);

    if (error.message === 'Profile picture not found') {
      res.status(404).json({ message: 'Profile picture not found' });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
};

module.exports = {
  createUserController,
  getUserController,
  updateUserController,
  uploadProfilePicController,
  getProfilePicController,
  deleteProfilePicController,
};