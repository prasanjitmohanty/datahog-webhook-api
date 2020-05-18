const RabbitMQSetup = require('./rabbitmq-setup');
const requestProcessor = require('./request-processor');
const REQUEST_MAIN_EXCHANGE =  'datahog.exchange.main';
const REQUEST_MAIN_QUEUE= 'datahog.main';


process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

function initRequestProcessorWorker(channel) {
  return requestProcessor.create('requestProcessor-1',
  REQUEST_MAIN_EXCHANGE,
  REQUEST_MAIN_QUEUE, channel)
  .start()
  .then(() => console.info('initRequestProcessorWorker started'));
}

function init() {
  return RabbitMQSetup.init()
    .then(result =>
        initRequestProcessorWorker(result.channel))
    .catch(error => console.error(`Failed to init connection or workers [error=${error.stack}]`));
}

init();