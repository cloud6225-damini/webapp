const validatePayload = (req, res, next) => {
    if (req.method === 'GET' && (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0)) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        return res.status(400).send(); 
    }
    next();
};
 
module.exports = validatePayload;