const express = require('express');
const multer = require('multer');
const {
  createUserController,
  getUserController,
  updateUserController,
  uploadProfilePicController,
  getProfilePicController,
  deleteProfilePicController,
  ensureVerifiedUser,
  verifyUser, // Import verifyUser
} = require('../controller/userController');
const authenticationCheck = require('../middleware/authenticationMiddleware');

const router = express.Router();
const upload = multer();
const headers = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
};

// HEAD and OPTIONS requests
router.head('/user/self', (req, res) => { res.status(405).header(headers).send(); });
router.head('/user', (req, res) => { res.status(405).header(headers).send(); });
router.options('/user', (req, res) => { res.status(405).header(headers).send(); });
router.options('/user/self', (req, res) => { res.status(405).header(headers).send(); });

// Public routes
router.post('/user', createUserController);

// Protected routes
router.get('/user/self', authenticationCheck, ensureVerifiedUser, getUserController);
router.put('/user/self', authenticationCheck, ensureVerifiedUser, updateUserController);

router.post('/user/self/pic', authenticationCheck, ensureVerifiedUser, upload.single('profilePic'), uploadProfilePicController);
router.get('/user/self/pic', authenticationCheck, ensureVerifiedUser, getProfilePicController);
router.delete('/user/self/pic', authenticationCheck, ensureVerifiedUser, deleteProfilePicController);

// Route for email verification
router.get('/verify', verifyUser);

module.exports = router;
