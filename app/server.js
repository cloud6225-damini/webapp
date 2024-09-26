require('dotenv').config();
const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const checkPayload = require('./middleware/routesMiddleware.js');
 
const app = express();
 
app.use(express.json());
 
app.use(checkPayload);
 
app.use('/healthz', healthRoutes);
 
app.all('/healthz', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.status(405).send();
});
 
app.use((req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.status(404).send();
});
 
const PORT = process.env.PORT || 3000;
 
app.listen(PORT, () => {
    console.log(`Server is running on the port: ${PORT}`);
});