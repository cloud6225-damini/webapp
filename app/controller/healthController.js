const { healthCheckAPI } = require('../services/healthService');

const getHealthStatus = async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    const isDatabaseConnected = await healthCheckAPI();
    
    if (isDatabaseConnected) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        return res.status(200).send();
    } else {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        return res.status(503).send();
    }
};


module.exports = { getHealthStatus };
