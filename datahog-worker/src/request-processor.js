const messagePublisher = require('./message-publisher');
class RequestProcessor {

  constructor(id, exchangeName, queueName, channel) {
    this.id = id;
    this.exchangeName = exchangeName;
    this.queueName = queueName;
    this.channel = channel;
    this.messagePublisherInstance = messagePublisher.create(exchangeName, queueName, channel);
    this.delays = [8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181];
  }

  start() {
    const consumer = (message) => {
      console.log(`consumer.....${message}`);
      if (message) {
        this.processMessage(message)
          .catch((e) => {
            console.error(`[${this.id}]Failed to process message ${e.stack}`);
            this.reject(message);
          });
      }
    };

    const options = { noAck: false };

    return this.channel
      .consume(this.queueName, consumer, options)
      .then(() => {
        console.info(`[${this.id}] Consumer registered successfully`);
      });
  }

  processMessage(message) {
    console.log('processMessage.....');
    const msg = parseMessage(message.content.toString());
    console.log(`Received message ${msg}`);

    if (this.hasExceededMaxAttempts(message)) {
      return this.reject(message);
    }
    
    return this.acknowledge('SUCCESS', message);
  }

  hasExceededMaxAttempts(message) {
    const receiveCount = Worker.getCurrentReceiveCount(message) + 1;
    return this.delays && receiveCount > this.delays.length;
  }

  acknowledge(status, message) {
    if (status === 'SUCCESS') {
      return this.accept(message);
    } else if (status === 'FAILED') {
      return this.reject(message);
    }
    return this.requeueWithDelay(message);
  }
  reject(message) {
    return new Promise((resolve, reject) => {
      try {
        this.channel.nack(message, false, false);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  requeueWithDelay(message) {
    return this.messagePublisherInstance.publishWithDelay(message, this.delay(message))
      .then(() => {
        this.accept(message);
      });
  }

  static getCurrentReceiveCount(message) {
    return (message.properties.headers.receiveCount || 0);
  }

  static parseMessage(message) {
    let jsonMessage;
    try {
      jsonMessage = JSON.parse(message);
    } catch (e) {
      console.error(e);
    }
    return jsonMessage;
  }

  accept(message) {
    return new Promise((resolve, reject) => {
      try {
        this.channel.ack(message);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  delay(message) {
    return 1000 * this.delays[Worker.getCurrentReceiveCount(message)];
  }
}

module.exports.create = (id, exchangeName, queueName, channel) =>
  new RequestProcessor(id, exchangeName, queueName, channel);
