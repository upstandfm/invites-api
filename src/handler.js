'use strict';

const DynamoDB = require('aws-sdk/clients/dynamodb');
const SNS = require('aws-sdk/clients/sns');
const bodyParser = require('@mooncake-dev/lambda-body-parser');
const createResHandler = require('@mooncake-dev/lambda-res-handler');
const {
  createStorageService,
  createInviteService,
  createController
} = require('./http');
const createPublisher = require('./publisher');
const createStreamSubscriber = require('./stream-subscriber');
const { captureError } = require('./utils');

const {
  CORS_ALLOW_ORIGIN,
  INVITES_TABLE_NAME,
  CREATE_WORKSPACE_INVITE_SCOPE,
  READ_WORKSPACE_INVITES_SCOPE,
  NEW_INVITE_SNS_ARN,
  DELETE_INVITE_SNS_ARN
} = process.env;

// For more info see:
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#constructor-property
const documentClient = new DynamoDB.DocumentClient({
  convertEmptyValues: true
});
const storageService = createStorageService(documentClient, INVITES_TABLE_NAME);
const inviteService = createInviteService(storageService);
const defaultHeaders = {
  'Access-Control-Allow-Origin': CORS_ALLOW_ORIGIN
};
const controller = createController(inviteService, {
  bodyParser,
  res: createResHandler(defaultHeaders)
});

const sns = new SNS();
const publisher = createPublisher(sns);
const streamSubscriber = createStreamSubscriber(publisher, {
  // The stream's event records can be unmarshalled using the DynamoDB
  // Converter to get a "regular" JavaScript Object
  //
  // For more info see:
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/Converter.html#unmarshall-property
  unmarshall: DynamoDB.Converter.unmarshall,
  topics: {
    onInsert: NEW_INVITE_SNS_ARN,
    onRemove: DELETE_INVITE_SNS_ARN
  }
});

/**
 * Lambda APIG proxy integration that creates a workspace invite.
 *
 * @param {Object} event - HTTP input
 * @param {Object} context - AWS lambda context
 *
 * @return {Object} HTTP output
 *
 * For more info on HTTP input see:
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 *
 * For more info on AWS lambda context see:
 * https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 *
 * For more info on HTTP output see:
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-output-format
 */
module.exports.createWorkspaceInvite = async (event, context) => {
  try {
    const res = await controller.createWorkspaceInvite(
      event,
      context,
      CREATE_WORKSPACE_INVITE_SCOPE
    );
    return res;
  } catch (err) {
    console.log('Failed to create workspace invite: ', err);
    captureError(context, err);
  }
};

/**
 * Lambda APIG proxy integration that gets all workspace invites.
 *
 * @param {Object} event - HTTP input
 * @param {Object} context - AWS lambda context
 *
 * @return {Object} HTTP output
 *
 * For more info on HTTP input see:
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 *
 * For more info on AWS lambda context see:
 * https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 *
 * For more info on HTTP output see:
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-output-format
 */
module.exports.getWorkspaceInvites = async (event, context) => {
  try {
    const res = await controller.getWorkspaceInvites(
      event,
      context,
      READ_WORKSPACE_INVITES_SCOPE
    );
    return res;
  } catch (err) {
    console.log('Failed to get workspace invites: ', err);
    captureError(context, err);
  }
};

/**
 * Lambda APIG proxy integration that publishes the change stream.
 *
 * For now only "INSERT" and "REMOVE" events are published.
 *
 * @param {Object} event - Stream event
 * @param {Object} context - AWS lambda context
 *
 * @return {Object} HTTP output
 *
 * For more info on processing stream records see:
 * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.Lambda.Tutorial.html
 *
 * For more info on AWS lambda context see:
 * https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 */
module.exports.processInvitesStream = async (event, context) => {
  try {
    await streamSubscriber.publishRecords(event, context);
  } catch (err) {
    console.log('Failed to publish ALL records: ', err);
    captureError(context, err);
  }
};
