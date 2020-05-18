const RabbitMQSetup = require('./rabbitmq-setup');
const RESPONSE_MAIN_EXCHANGE =  'datahog.exchange.response.main';
class ResponseMessagePublisher{
    constructor(delay, channel) {
        this.exchange = RESPONSE_MAIN_EXCHANGE;
        this.routingKey = 'response';
        this.delay = delay || 0;
        this.channel = channel;
      }
    
      publish(message) {
        if (!this.channel) {
          return MessagePublisher.getConnection()
            .then((result) => {
              console.info('Connection was established');
              this.channel = result.channel;
              return this.publish(message);
            })
            .catch(e => console.error(`Failed to obtain connection ${e}`));
        }
    
        console.info(`Publishing message to the exchange ${this.exchange}: ${JSON.stringify(message)}`);
        return this.doPublishWithDelay(message)
          .then(() => {
            console.info(`Published message to the exchange ${this.exchange} SUCCESSFULLY`);
          })
          .catch((e) => {
            console.error(`Could not publish message to the exchange ${this.exchange}. Retrying! [error=${e}]`);
            return this.publish(message);
          });
      }
    
       static getConnection() {
        return RabbitMQSetup.init();
      }
    
      doPublishWithDelay(message) {
        this.channel.publish(
          this.exchange,
          this.routingKey,
          Buffer.from(JSON.stringify(message), 'utf-8'), {
            persistent: true,
            headers: { 'x-delay': this.delay },
            mandatory: true,
          });
        return this.channel.waitForConfirms();
      }
}

module.exports = (delay, channel) =>
  new ResponseMessagePublisher(delay, channel);