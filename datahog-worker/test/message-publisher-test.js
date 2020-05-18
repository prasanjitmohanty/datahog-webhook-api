const expect = require('chai').expect;
const config = require('config');

const RabbitMQSetup = require('../src/rabbitmq-setup');
const publisherQueue = require('../src/message-publisher');

const sinon = require('sinon');

const fakeChannel = {
  publish: () => {},
  waitForConfirms: () => {},
};

describe('message publisher test', () => {
  describe('publish', () => {
    config.RabbitMQ.username = 'guest';
    config.RabbitMQ.password = 'guest';
    config.RabbitMQ.host = 'localhost';
    config.RabbitMQ.port = '5672';

    it('should call init if channel is undefined', () => {
      const mockRabbitMQConfiguration = sinon.mock(RabbitMQSetup);
      mockRabbitMQConfiguration.expects('init').once().resolves({ channel: {} });

      //const publisher = publisherQueue();
      const stubChannelPublish = sinon.stub(publisherQueue, 'doPublishWithDelay');
      stubChannelPublish.resolves();

      return publisher.publish('test message').then(() => {
        mockRabbitMQConfiguration.verify();
        stubChannelPublish.restore();
      });
    });

    it('should publish message to the expected exchange', () => {
      const mockRabbitMQConfiguration = sinon.mock(RabbitMQSetup);
      mockRabbitMQConfiguration.expects('init').once().resolves({ channel: {} });
      const publisher = publisherQueue('some-exchange', 'some-routing-key', 0, fakeChannel);
      const mockChannel = sinon.mock(fakeChannel);
      mockChannel
        .expects('publish')
        .withArgs(
          'some-exchange',
          'some-routing-key',
          Buffer.from(JSON.stringify('test'), 'utf-8'),
        {
          persistent: true,
          headers: { 'x-delay': 0 },
          mandatory: true,
        })
        .once().resolves();

      mockChannel
        .expects('waitForConfirms')
        .once().returns(Promise.resolve(true));

      publisher.publish('test message').then(() => {
        mockChannel.verify();
      });
    });

  });
});
