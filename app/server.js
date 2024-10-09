require('dotenv').config({ path: '../.env' });
const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const validatePayload = require('./middleware/routesMiddleware.js');
const userRoutes = require('./routes/userRoutes');
const { createDatabase } = require('./databaseConfig/databaseConnect.js');

const app = express();

app.use(express.json());
app.use(validatePayload);

app.use('/healthz', healthRoutes);
app.use('/v1', userRoutes);

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

module.exports = app;

createDatabase()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Failed to initialize database,", err);
  });