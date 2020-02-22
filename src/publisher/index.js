'use strict';

/**
 * Create an SNS publisher service.
 *
 * @param {Object} client - SNS Messaging client
 *
 * @return {Object} Publiser service interface
 */
module.exports = function createPublisher(client) {
  if (!client) {
    throw new Error('Provide a messaging client');
  }

  return {
    /**
     * Send a message to a topic.
     *
     * @param {String} address - The topic address (SNS topic ARN)
     * @param {Object} data - The message payload
     *
     * @return {Promise} Resolves with SNS data object with the sent MessageId
     *
     * For SDK docs see:
     * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property
     */
    sendMessage(address, data) {
      const params = {
        Message: JSON.stringify(data),
        TopicArn: address
      };
      return client.publish(params).promise();
    }
  };
};
