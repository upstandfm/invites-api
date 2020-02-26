'use strict';

const bodyParser = require('@mooncake-dev/lambda-body-parser');
const createResHandler = require('@mooncake-dev/lambda-res-handler');
const createController = require('.');

const userId = 'user|56ea6578fea85678ae4e4a65';
const workspaceId = 'a2xpQr34';
const fakeInvites = [
  {
    id: 'x1F2Pqr5',
    workspaceId,
    email: 'rick@upstand.fm',
    inviterFullName: '',
    createdBy: 'system',
    createdAt: '2020-01-22T11:25:20.091Z',
    updatedAt: '2020-01-22T11:25:20.091Z',
    status: 'accepted'
  },

  {
    id: 'EjezHSJY',
    workspaceId,
    email: 'daniel@upstand.fm',
    inviterFullName: 'Rick Sanchez',
    createdBy: 'user|57ea6f71fea85e3a5aa4a61',
    createdAt: '2020-02-26T12:45:10.087Z',
    updatedAt: '2020-02-26T12:45:10.087Z',
    status: 'pending'
  }
];

const fakeInvitesService = {
  getAll: () => Promise.resolve(fakeInvites)
};

const options = {
  bodyParser,
  res: createResHandler()
};

const controller = createController(fakeInvitesService, options);

const fakeEvent = {
  resource: '',
  path: '/',
  httpMethod: 'GET',
  headers: {},
  multiValueHeaders: {},
  queryStringParameters: {},
  multiValueQueryStringParameters: {},
  pathParameters: {},
  stageVariables: {},
  requestContext: {},
  body: '',
  isBase64Encoded: false
};

const fakeContext = {
  captureError: () => undefined
};

const requiredScope = 'read:workspace-invites';

describe('getWorkspaceInvites(event, context, requiredScope)', () => {
  it('returns error as JSON response with missing authorizer data', async () => {
    const res = await controller.getWorkspaceInvites(
      fakeEvent,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 500,
      body: JSON.stringify({
        message: 'Missing authorizer data',
        details: 'Corrupt authorizer data. Contact "support@upstand.fm"'
      })
    });
  });

  it('returns error as JSON response with missing authorizer user ID', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {}
      }
    };
    const res = await controller.getWorkspaceInvites(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 500,
      body: JSON.stringify({
        message: 'Missing user id',
        details: 'Corrupt authorizer data. Contact "support@upstand.fm"'
      })
    });
  });

  it('returns error as JSON response with missing authorizer workspace ID', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId
        }
      }
    };
    const res = await controller.getWorkspaceInvites(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 500,
      body: JSON.stringify({
        message: 'Missing workspace id',
        details: 'Corrupt authorizer data. Contact "support@upstand.fm"'
      })
    });
  });

  it('returns error as JSON response with missing scope', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId
        }
      }
    };
    const res = await controller.getWorkspaceInvites(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 403,
      body: JSON.stringify({
        message: 'Forbidden',
        details: 'You need scope "read:workspace-invites"'
      })
    });
  });

  it('returns error as JSON response with incorrect scope', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId,
          scope: 'read:invitations'
        }
      }
    };
    const res = await controller.getWorkspaceInvites(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 403,
      body: JSON.stringify({
        message: 'Forbidden',
        details: 'You need scope "read:workspace-invites"'
      })
    });
  });

  it('returns invites as JSON response', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId,
          scope: requiredScope
        }
      }
    };
    const res = await controller.getWorkspaceInvites(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 200,
      body: JSON.stringify({
        items: fakeInvites
      })
    });
  });
});
