FROM rabbitmq:3.8-management-alpine

ADD https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v3.8.0/rabbitmq_delayed_message_exchange-3.8.0.ez $RABBITMQ_HOME/plugins/rabbitmq_delayed_message_exchange-3.8.0.ez

RUN chown rabbitmq:rabbitmq $RABBITMQ_HOME/plugins/rabbitmq_delayed_message_exchange-3.8.0.ez \
    && rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange \
    && rabbitmq-plugins enable --offline rabbitmq_consistent_hash_exchange