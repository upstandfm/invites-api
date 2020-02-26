'use strict';

const bodyParser = require('@mooncake-dev/lambda-body-parser');
const createResHandler = require('@mooncake-dev/lambda-res-handler');
const createController = require('.');

const workspaceId = 'a2xpQr34';
const userId = 'user|56ea6578fea85678ae4e4a65';
const email = 'daniel@upstand.fm';
const inviterFullName = 'Rick Sanchez';

const fakeInvite = {
  id: 'EjezHSJY',
  workspaceId,
  email,
  inviterFullName,
  createdBy: 'user|57ea6f71fea85e3a5aa4a61',
  createdAt: '2020-02-26T12:45:10.087Z',
  updatedAt: '2020-02-26T12:45:10.087Z',
  status: 'pending'
};

const fakeInvitesService = {
  create: () => Promise.resolve(fakeInvite)
};

const options = {
  bodyParser,
  res: createResHandler()
};

const controller = createController(fakeInvitesService, options);

const fakeEvent = {
  resource: '',
  path: '/',
  httpMethod: 'POST',
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

const requiredScope = 'create:workspace-invite';

describe('controller.createWorkspaceInvite(event, context, requiredScope)', () => {
  it('returns error as JSON response with missing authorizer data', async () => {
    const res = await controller.createWorkspaceInvite(
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
    const res = await controller.createWorkspaceInvite(
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
    const res = await controller.createWorkspaceInvite(
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
    const res = await controller.createWorkspaceInvite(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 403,
      body: JSON.stringify({
        message: 'Forbidden',
        details: 'You need scope "create:workspace-invite"'
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
          scope: 'create:invitations'
        }
      }
    };
    const res = await controller.createWorkspaceInvite(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 403,
      body: JSON.stringify({
        message: 'Forbidden',
        details: 'You need scope "create:workspace-invite"'
      })
    });
  });

  it('returns error as JSON response with missing email in request body', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId,
          scope: requiredScope
        }
      },
      body: JSON.stringify({})
    };
    const res = await controller.createWorkspaceInvite(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request data',
        details: ['"email" is required']
      })
    });
  });

  it('returns error as JSON response with invalid email in request body', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId,
          scope: requiredScope
        }
      },
      body: JSON.stringify({
        email: 'https://www.upstand.fm'
      })
    };
    const res = await controller.createWorkspaceInvite(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request data',
        details: ['"email" must be a valid email']
      })
    });
  });

  it('returns error as JSON response with missing inviter full name in request body', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId,
          scope: requiredScope
        }
      },
      body: JSON.stringify({
        email: 'daniel@upstand.fm'
      })
    };
    const res = await controller.createWorkspaceInvite(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request data',
        details: ['"inviterFullName" is required']
      })
    });
  });

  it('returns error as JSON response with invalid inviter full name in request body', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId,
          scope: requiredScope
        }
      },
      body: JSON.stringify({
        email,
        inviterFullName: 1
      })
    };
    const res = await controller.createWorkspaceInvite(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request data',
        details: ['"inviterFullName" must be a string']
      })
    });
  });

  it('returns error as JSON response with too long inviter full name in request body', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId,
          scope: requiredScope
        }
      },
      body: JSON.stringify({
        email,
        inviterFullName:
          'Hello this is a very long piece of text to see if we validate for too long strings'
      })
    };
    const res = await controller.createWorkspaceInvite(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request data',
        details: [
          '"inviterFullName" length must be less than or equal to 70 characters long'
        ]
      })
    });
  });

  it('returns created invite as JSON response', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId,
          scope: requiredScope
        }
      },
      body: JSON.stringify({
        email,
        inviterFullName
      })
    };
    const res = await controller.createWorkspaceInvite(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 201,
      body: JSON.stringify(fakeInvite)
    });
  });
});
