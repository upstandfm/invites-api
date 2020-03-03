'use strict';

const { captureError } = require('../../utils');
const { validateAuthorizerData, validateScope } = require('../validators');
const schema = require('../schema');

/**
 * Create a controller to handle HTTP requests.
 *
 * @param {Object} invite - Invite service
 * @param {Object} options
 *
 * @param {Object} options.bodyParser
 * @param {Function} options.bodyParser.json - Parse a JSON string
 *
 * @param {Object} options.res
 * @param {Function} options.res.json - Send a JSON response
 *
 * @return {Object} Controller interface
 */
module.exports = function createController(invite, options = {}) {
  if (!invite) {
    throw new Error('Provide an invite service');
  }

  const { bodyParser = {}, res = {} } = options;

  if (!bodyParser.json || typeof bodyParser.json !== 'function') {
    throw new Error('Provide a body parser function to parse JSON strings');
  }

  if (!res.json || typeof res.json !== 'function') {
    throw new Error('Provide a function to send JSON responses');
  }

  return {
    /**
     * Create a workspace invite.
     *
     * @param {Object} event - Lambda HTTP input
     * @param {Object} context - Lambda context
     * @param {String} requiredScope - The scope a consumer must have to perform this action
     *
     * @return {Promise} Resolves with HTTP output object
     *
     */
    async createWorkspaceInvite(event, context, requiredScope) {
      try {
        const { authorizer } = event.requestContext;

        validateAuthorizerData(authorizer);
        validateScope(authorizer.scope, requiredScope);

        const body = bodyParser.json(event.body);
        const data = schema.validateInvite(body);
        const item = await invite.create(
          authorizer.workspaceId,
          authorizer.userId,
          data
        );

        return res.json(201, item);
      } catch (err) {
        captureError(context, err);

        const statusCode = err.statusCode || 500;
        const resData = {
          message: err.message,
          details: err.details
        };
        return res.json(statusCode, resData);
      }
    },

    /**
     * Get all workspace invites.
     *
     * @param {Object} event - Lambda HTTP input
     * @param {Object} context - Lambda context
     * @param {String} requiredScope - The scope a consumer must have to perform this action
     *
     * @return {Promise} Resolves with HTTP output object
     *
     */
    async getWorkspaceInvites(event, context, requiredScope) {
      try {
        const { authorizer } = event.requestContext;

        validateAuthorizerData(authorizer);
        validateScope(authorizer.scope, requiredScope);

        const items = await invite.getAll(authorizer.workspaceId);
        const resData = {
          items
        };

        return res.json(200, resData);
      } catch (err) {
        captureError(context, err);

        const statusCode = err.statusCode || 500;
        const resData = {
          message: err.message,
          details: err.details
        };
        return res.json(statusCode, resData);
      }
    }
  };
};
