const express = require('express');
const bodyParser = require('body-parser');
const messagePublisher = require('./message-publisher')();
 
const app = express();
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
const port = 5000;
app.get('/', function (req, res) {
  res.send('hello1 world2...');
});
app.post('/data', function (req, res) {
  console.log('pm...........');
  console.log(JSON.stringify(req.body));
    let provider = req.body.provider;
    let callbackUrl = req.body.callbackUrl;
    messagePublisher.publish(req.body);

    res.send(`Got a POST request ${provider}:${callbackUrl}`);
  });

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));