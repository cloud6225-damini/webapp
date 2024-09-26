const express = require('express');
const { getHealthStatus } = require('../controller/healthController');

const router = express.Router();

router.get('/', getHealthStatus);
module.exports = router;
