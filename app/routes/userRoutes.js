const express = require('express');
const multer = require('multer');
const {
  createUserController,
  getUserController,
  updateUserController,
  uploadProfilePicController,
  getProfilePicController,
  deleteProfilePicController,
} = require('../controller/userController');
const authenticationCheck = require('../middleware/authenticationMiddleware');

const router = express.Router();
const upload = multer();
const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
};

router.head('/user/self', (req,res) => {res.status(405).header(headers).send();});
router.head('/user', (req,res) => {res.status(405).header(headers).send();});
router.options('/user', (req,res) => {res.status(405).header(headers).send();});
router.options('/user/self', (req,res) => {res.status(405).header(headers).send();});

router.post('/user', createUserController);

router.get('/user/self', authenticationCheck, getUserController);
router.put('/user/self', authenticationCheck, updateUserController);

router.post('/user/self/pic', authenticationCheck, upload.single('profilePic'), uploadProfilePicController);
router.get('/user/self/pic', authenticationCheck, getProfilePicController);
router.delete('/user/self/pic', authenticationCheck, deleteProfilePicController);

module.exports = router;
