const routes = require('express').Router();
const REQUEST_MAIN_EXCHANGE = 'datahog.exchange.main';
const messagePublisher = require('../message-broker/message-publisher')(REQUEST_MAIN_EXCHANGE);

routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' });
});

routes.get('/health', function (req, res) {
  res.send('datahog up...');
});

routes.post('/processProvider', function (req, res) {
  console.log(JSON.stringify(req.body));
  let provider = req.body.provider;
  let callbackUrl = req.body.callbackUrl;
  if (provider && callbackUrl) {
    //Queue the request for processing
    messagePublisher.publish(req.body);
  } else {
    throw new Error(`Invalid request`);
  }

  res.send(`Got a POST request ${provider}:${callbackUrl}`);
});

module.exports = routes;