'use strict';

const shortid = require('shortid');

module.exports = {
  /**
   * Create a workspace invite.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName
   * @param {String} workspaceId
   * @param {String} createdByUserId
   * @param {Object} inviteData
   *
   * @return {Promise} Resolves with DynamoDB data
   *
   * For SDK documentation see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
   */
  createOne(client, tableName, workspaceId, createdByUserId, inviteData) {
    const now = new Date().toISOString();
    const insertData = {
      ...inviteData,
      id: shortid.generate(),
      workspaceId,
      createdBy: createdByUserId,
      createdAt: now,
      updatedAt: now,
      status: 'pending'
    };

    const params = {
      TableName: tableName,

      // Prevent replacing an item
      // The write ONLY succeeds when the condition expression evaluates to
      // "true"
      // For more info see:
      // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html#Expressions.ConditionExpressions.PreventingOverwrites
      ConditionExpression: 'attribute_not_exists(id)',

      Item: {
        pk: `workspace#${workspaceId}`,
        sk: `invite#${inviteData.email}`,
        ...insertData
      }
    };

    return client
      .put(params)
      .promise()
      .then(() => {
        return insertData;
      })
      .catch(err => {
        if (err.code === 'ConditionalCheckFailedException') {
          const duplicateErr = new Error(
            'Invite for this email already exists'
          );
          duplicateErr.statusCode = 400;
          throw duplicateErr;
        }

        throw err;
      });
  },

  /**
   * Get all workspace invites.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName
   * @param {String} workspaceId
   *
   * @return {Promise} Resolves with DynamoDB data
   *
   * For SDK documentation see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property
   */
  getAll(client, tableName, workspaceId) {
    const params = {
      TableName: tableName,
      ExpressionAttributeValues: {
        ':pk': `workspace#${workspaceId}`,
        ':sk_start': 'invite#'
      },
      KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk_start)',
      ExpressionAttributeNames: {
        '#s': 'status'
      },
      ProjectionExpression:
        'id, workspaceId, createdBy, createdAt, updatedAt, #s, email, createdByFullName'
    };
    return client.query(params).promise();
  }
};
