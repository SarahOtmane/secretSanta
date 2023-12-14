const express = require('express')
const app = express()  
const port = 3000;

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger-config.js');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/apiSecretSanta');

app.use(express.urlencoded());
app.use(express.json());

const userRoute = require('./routes/userRoute');
userRoute(app);

const groupRoute = require('./routes/groupRoute');
groupRoute(app);

app.listen(port, () =>{
    console.log(`Example app listenning on port ${port}`);
})
