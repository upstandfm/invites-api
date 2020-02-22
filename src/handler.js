'use strict';

const DynamoDB = require('aws-sdk/clients/dynamodb');
const SNS = require('aws-sdk/clients/sns');
const bodyParser = require('@mooncake-dev/lambda-body-parser');
const createResHandler = require('@mooncake-dev/lambda-res-handler');
const createPublisher = require('./publisher');
const createStreamSubscriber = require('./stream-subscriber');
const { validateAuthorizerData, validateScope } = require('./validators');
const schema = require('./schema');
const invites = require('./invites');
const handleAndSendError = require('./handle-error');
const { captureError } = require('./utils');

const {
  CORS_ALLOW_ORIGIN,
  INVITES_TABLE_NAME,
  CREATE_WORKSPACE_INVITE_SCOPE,
  READ_WORKSPACE_INVITES_SCOPE,
  NEW_INVITE_SNS_ARN,
  DELETE_INVITE_SNS_ARN
} = process.env;

const defaultHeaders = {
  'Access-Control-Allow-Origin': CORS_ALLOW_ORIGIN
};
const sendRes = createResHandler(defaultHeaders);

// For more info see:
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#constructor-property
const documentClient = new DynamoDB.DocumentClient({
  convertEmptyValues: true
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
    const { authorizer } = event.requestContext;

    validateAuthorizerData(authorizer);
    validateScope(authorizer.scope, CREATE_WORKSPACE_INVITE_SCOPE);

    const body = bodyParser.json(event.body);
    const inviteData = schema.validateInvite(body);
    const createdInvite = await invites.createOne(
      documentClient,
      INVITES_TABLE_NAME,
      authorizer.workspaceId,
      authorizer.userId,
      inviteData
    );

    return sendRes.json(201, createdInvite);
  } catch (err) {
    return handleAndSendError(context, err, sendRes);
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
    const { authorizer } = event.requestContext;

    validateAuthorizerData(authorizer);
    validateScope(authorizer.scope, READ_WORKSPACE_INVITES_SCOPE);

    const invitesData = await invites.getAll(
      documentClient,
      INVITES_TABLE_NAME,
      authorizer.workspaceId
    );

    const resData = {
      items: invitesData.Items
    };

    return sendRes.json(200, resData);
  } catch (err) {
    return handleAndSendError(context, err, sendRes);
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
