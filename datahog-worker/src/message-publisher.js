class MessagePublisher {

    constructor(exchangeName, routingKey, channel) {
      this.exchangeName = exchangeName;
      this.routingKey = routingKey;
      this.channel = channel;
    }
  
    publishWithDelay(message, delay) {
      logger.info(`Publishing message with ${delay} ms delay`);
      this.channel.publish(
        this.exchangeName,
        this.routingKey,
        Buffer.from(JSON.stringify(message), 'utf-8'), {
          persistent: true,
          headers: { 'x-delay': delay, receiveCount: MessagePublisher.getCurrentReceiveCount(message) + 1 },
        });
      return this.channel.waitForConfirms();
    }
  
    static getCurrentReceiveCount(message) {
      return (message.properties.headers.receiveCount || 0);
    }
  }
  
  module.exports.create = (exchangeName, routingKey, channel) =>
    new MessagePublisher(exchangeName, routingKey, channel);