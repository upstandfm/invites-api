'use strict';

const { captureError } = require('../utils');
const schema = require('./schema');

/**
 * Create a DynamoDB stream subscriber service.
 *
 * The stream subscriber consumes a DynamoDB change stream, and for each record
 * in the stream it broadcasts a message.
 *
 * @param {Object} publisher - Publisher service
 * @param {Object} options
 * @param {Function} options.unmarshall - Unmarshall a DynamoDB record
 * @param {Object} options.topics
 * @param {String} options.topics.onInsert - Topic to send to when a new item was added to the table
 * @param {String} options.topics.onRemove - Topic to send to when the item was deleted from the table
 *
 * @return {Object} Stream subscriber interface
 *
 */
module.exports = function createStreamSubscriber(publisher, options = {}) {
  if (!publisher) {
    throw new Error('Provide a publisher service');
  }

  const { unmarshall, topics } = options;

  if (!unmarshall || typeof unmarshall !== 'function') {
    throw new Error('Provide a function to unmarshall DynamoDB records');
  }

  if (!topics.onInsert) {
    throw new Error(
      'Provide a topic to send messages to when an item is inserted to DynamoDB'
    );
  }

  if (!topics.onRemove) {
    throw new Error(
      'Provide a topic to send messages to when an item is removed from DynamoDB'
    );
  }

  return {
    /**
     * Publish records in a change stream.
     *
     * For now only "INSERT" and "REMOVE" events are published.
     *
     * @param {Object} event - DynamoDB stream event
     * @param {Object} context - AWS Lambda context
     *
     * @param {Promise} Void
     */
    async publishRecords(event, context) {
      for (const record of event.Records) {
        try {
          schema.validateRecord(record);

          const { eventName } = record;

          if (eventName === 'INSERT') {
            const { NewImage } = record.dynamodb;
            const newImg = unmarshall(NewImage);
            const { MessageId } = await publisher.sendMessage(
              topics.onInsert,
              newImg
            );

            console.log(
              `Published message "${MessageId}" to "${topics.onInsert}"`
            );
            continue;
          }

          if (eventName === 'REMOVE') {
            const { OldImage } = record.dynamodb;
            const oldImg = unmarshall(OldImage);
            const { MessageId } = await publisher.sendMessage(
              topics.onRemove,
              oldImg
            );

            console.log(
              `Published message "${MessageId}" to "${topics.onRemove}"`
            );
            continue;
          }
        } catch (err) {
          console.log('Error: ', err);
          console.log(
            'Failed to process record: ',
            JSON.stringify(record, null, 2)
          );

          captureError(context, err);

          // TODO: send failed record to DLQ

          continue;
        }
      }
    }
  };
};
