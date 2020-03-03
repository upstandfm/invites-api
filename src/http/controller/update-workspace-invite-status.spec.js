'use strict';

const bodyParser = require('@mooncake-dev/lambda-body-parser');
const createResHandler = require('@mooncake-dev/lambda-res-handler');
const createController = require('.');

const workspaceId = 'a2xpQr34';
const email = 'daniel@upstand.fm';

const fakeUpdatedInvite = {
  updatedAt: '2020-02-26T12:45:10.087Z',
  status: 'accepted'
};

const fakeInviteService = {
  updateStatus: () => Promise.resolve(fakeUpdatedInvite)
};

const options = {
  bodyParser,
  res: createResHandler()
};

const controller = createController(fakeInviteService, options);

const fakeEvent = {
  resource: '',
  path: '/status',
  httpMethod: 'PATCH',
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

const requiredScope = 'update:workspace-invite-status';

describe('controller.updateWorkspaceInviteStatus(event, context, requiredScope)', () => {
  it('returns error as JSON response with missing scope', async () => {
    const res = await controller.updateWorkspaceInviteStatus(
      fakeEvent,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 403,
      body: JSON.stringify({
        message: 'Forbidden',
        details: 'You need scope "update:workspace-invite-status"'
      })
    });
  });

  it('returns error as JSON response with incorrect scope', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          scope: 'update:invitations-stat'
        }
      }
    };
    const res = await controller.updateWorkspaceInviteStatus(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 403,
      body: JSON.stringify({
        message: 'Forbidden',
        details: 'You need scope "update:workspace-invite-status"'
      })
    });
  });

  it('returns error as JSON response with missing workspace ID in request body', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          scope: requiredScope
        }
      },
      body: JSON.stringify({})
    };
    const res = await controller.updateWorkspaceInviteStatus(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request data',
        details: ['"workspaceId" is required']
      })
    });
  });

  it('returns error as JSON response with invalid workspace ID in request body', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          scope: requiredScope
        }
      },
      body: JSON.stringify({
        workspaceId: false
      })
    };
    const res = await controller.updateWorkspaceInviteStatus(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request data',
        details: ['"workspaceId" must be a string']
      })
    });
  });

  it('returns error as JSON response with missing email in request body', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          scope: requiredScope
        }
      },
      body: JSON.stringify({
        workspaceId
      })
    };
    const res = await controller.updateWorkspaceInviteStatus(
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
          scope: requiredScope
        }
      },
      body: JSON.stringify({
        workspaceId,
        email: 'https://www.upstand.fm'
      })
    };
    const res = await controller.updateWorkspaceInviteStatus(
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

  it('returns error as JSON response with missing status in request body', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          scope: requiredScope
        }
      },
      body: JSON.stringify({
        workspaceId,
        email
      })
    };
    const res = await controller.updateWorkspaceInviteStatus(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request data',
        details: ['"status" is required']
      })
    });
  });

  it('returns error as JSON response with invalid status value in request body', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          scope: requiredScope
        }
      },
      body: JSON.stringify({
        workspaceId,
        email,
        status: 'YOLO'
      })
    };
    const res = await controller.updateWorkspaceInviteStatus(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request data',
        details: ['"status" must be one of [accepted, error]']
      })
    });
  });

  it('returns updated invite as JSON response', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          scope: requiredScope
        }
      },
      body: JSON.stringify({
        workspaceId,
        email,
        status: fakeUpdatedInvite.status
      })
    };
    const res = await controller.updateWorkspaceInviteStatus(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 200,
      body: JSON.stringify(fakeUpdatedInvite)
    });
  });
});
