const { healthCheckAPI } = require('../services/healthService');

// Controller to handle the /healthz endpoint
const getHealthStatus = async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    const isDatabaseConnected = await healthCheckAPI();
    
    if (isDatabaseConnected) {
        return res.status(200).send();
    } else {
        return res.status(503).send();
    }
};

module.exports = { getHealthStatus };
