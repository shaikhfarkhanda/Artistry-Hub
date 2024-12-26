// server/server.js

const express = require('express');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/user'); // Adjust path accordingly
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api/users', usersRouter); // Define your users API route

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
