const config = require('config')
const amqp = require('amqplib');
const REQUEST_MAIN_EXCHANGE =  'datahog.exchange.main';
const REQUEST_MAIN_QUEUE= 'datahog.main';
const REQUEST_DEADLETTER_EXCHANGE= 'datahog.exchange.dead';
const REQUEST_DEADLETTER_QUEUE= 'datahog.dead';
class RabbitMQSetup {
   static init() {
    const amqpUrl = `amqp://${config.RabbitMQ.username}:${config.RabbitMQ.password}@${config.RabbitMQ.host}:${config.RabbitMQ.port}`;
    //const amqpUrl = `amqp://guest:guest@rabbitmq:5672`;
    console.log(`Queue Url - ${amqpUrl}`)
    return amqp.connect(amqpUrl)
      .then((connection) => {
        connection
          .on('close', () => {
            console.log('Connection closed, trying to reconnect');
            RabbitMQSetup.init();
          })
          .on('error', (e) => {
            console.log(`Connection error (reconnecting): ${e.stack}`);
            RabbitMQSetup.init();;
          });
        return RabbitMQSetup.createChannel(connection);
      });
  }
  
  static createChannel(connection) {
    return connection
      .createConfirmChannel()
      .then((channel) => {
        console.info('Created channel');
        channel
          .on('close', () => console.info('Closing channel'))
          .on('error', e => console.error(`Channel error [error=${e}]`))
          .on('return', (message) => {
            if (message) {
              console.error(`Message returned ${message.content.toString()}`);
            }
          });
  
        return RabbitMQSetup.assertRequestDeadLetterExchangeAndQueue(channel)
          .then(() => RabbitMQSetup.assertRequestMainExchangeAndQueue(channel))
          .then(() => ({ connection, channel }))
          .catch(e => console.error(`Failed to assert exchange/queue: ${e}`));
      });
  }
  
  static assertRequestMainExchangeAndQueue(channel) {
    console.info('Asserting request main exchange and queue');
    return channel
      .assertExchange(REQUEST_MAIN_EXCHANGE, 'x-delayed-message', {
        durable: true,
        arguments: { 'x-delayed-type': 'direct' },
      })
      .then(() => channel
          .assertQueue(REQUEST_MAIN_QUEUE, {
            durable: true,
            deadLetterExchange: REQUEST_DEADLETTER_EXCHANGE,
            deadLetterRoutingKey: REQUEST_DEADLETTER_QUEUE,
          }))
      .then(q => channel.bindQueue(q.queue,
        REQUEST_MAIN_EXCHANGE,
        q.queue));
  }
  
  static assertRequestDeadLetterExchangeAndQueue(channel) {
    console.info('Asserting request dead-letter exchange and queue');
    return channel
      .assertExchange(REQUEST_DEADLETTER_EXCHANGE,
        'direct',
        { durable: true })
      .then(() => channel.assertQueue(REQUEST_DEADLETTER_QUEUE,
        { durable: true }))
      .then(q => channel.bindQueue(q.queue,
        REQUEST_DEADLETTER_EXCHANGE,
        q.queue));
  }

}

 

module.exports = RabbitMQSetup;