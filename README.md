# datahog-webhook-api
Webhook based NodeJS Async API. This API uses NodeJs, Express JS and RabbitMQ delayed message to achieve async functionality.
# Components
## datahog-api  
- Receives post request /processProvider endpoint
- Publishes the request in Main RabbitMQ Exchange for async processing
- Sends acknowledgement of request
- rabbitmq-setup - sets up request and response queues.
## datahog-worker
- request-processor - Manages retrieval and delay processing of messages. In case of success response put the result and callback into results queue
- response-processor - Manages retrieval and delay processing of results from provider
- provider-service - Uses axios to retieve dta from provider
- provider-response-service - Uses axios post to send results to the callback Url
- rabbitmq-setup - sets up request and response queues.
# Running the code Locally
- `docker-compose build`
- `docker-compose up`

