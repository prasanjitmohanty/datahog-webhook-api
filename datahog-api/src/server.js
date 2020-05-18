const express = require('express');
const routes = require('./routes');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', routes);
const port = 5000;

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));