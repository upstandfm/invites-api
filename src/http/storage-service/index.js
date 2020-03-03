'use strict';

const shortid = require('shortid');

/**
 * Create DynamoDB storage service.
 *
 * @param {Object} client - DynamoDB document client
 * @param {String} tableName
 *
 * @return {Object} Storage service interface
 */
module.exports = function createStorageService(client, tableName) {
  if (!client) {
    throw new Error('Provide a storage client');
  }

  if (!tableName) {
    throw new Error('Provide a table name');
  }

  return {
    /**
     * Insert a workspace invite item.
     *
     * @param {Object} item
     * @param {String} item.workspaceId,
     * @param {String} item.createdBy
     * @param {String} item.createdAt
     * @param {String} item.updatedAt
     * @param {String} item.status
     * @param {String} item.email
     * @param {String} item.inviterFullName
     *
     * @return {Promise} Resolves with created item
     *
     * For SDK documentation see:
     * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
     */
    insertWorkspaceInvite(item) {
      const data = {
        ...item,
        id: shortid.generate()
      };

      const params = {
        TableName: tableName,

        // Prevent replacing an existing item
        // The write will ONLY succeeds when the condition expression evaluates
        // to "true"
        // For more info see:
        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html#Expressions.ConditionExpressions.PreventingOverwrites
        ConditionExpression: 'attribute_not_exists(id)',

        Item: {
          pk: `workspace#${item.workspaceId}`,
          sk: `invite#${item.email}`,
          ...data
        }
      };

      return client
        .put(params)
        .promise()
        .then(() => data)
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
     * Update a workspace invite item status attribute.
     *
     * @param {String} workspaceId
     * @param {String} email
     * @param {Object} item
     *
     * @param {String} item.status
     * @param {String} item.updatedAt
     *
     * @return {Promise} Resolves with updated item
     *
     * For SDK documentation see:
     * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#update-property
     */
    updateWorkspaceInviteStatus(workspaceId, email, item) {
      const params = {
        TableName: tableName,

        // Prevent creating a new item
        // The update will ONLY succeeds when the condition expression evaluates
        // to "true"
        // For more info see:
        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html#Expressions.ConditionExpressions.PreventingOverwrites
        ConditionExpression: 'attribute_exists(id)',

        Key: {
          pk: `workspace#${workspaceId}`,
          sk: `invite#${email}`
        },

        // "status" is a reserved keyword
        // For more info see:
        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
        ExpressionAttributeNames: {
          '#s': 'status'
        },
        ExpressionAttributeValues: {
          ':s': item.status,
          ':ua': item.updatedAt
        },
        UpdateExpression: 'set #s = :s, updatedAt = :ua'
      };

      return client
        .update(params)
        .promise()
        .then(() => item)
        .catch(err => {
          if (err.code === 'ConditionalCheckFailedException') {
            const noInviteErr = new Error('Invite does not exist');
            noInviteErr.statusCode = 400;
            throw noInviteErr;
          }

          throw err;
        });
    },

    /**
     * Query workspace invite items.
     *
     * @param {String} workspaceId
     *
     * @return {Promise} Resolves with items
     *
     * For SDK documentation see:
     * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property
     */
    queryWorkspaceInvites(workspaceId) {
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

      return client
        .query(params)
        .promise()
        .then(res => res.Items);
    }
  };
};
