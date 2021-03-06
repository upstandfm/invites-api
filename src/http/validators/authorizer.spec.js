'use strict';

const validateAuthorizerData = require('./authorizer');

const errDetails = `Corrupt authorizer data. Contact "support@upstand.fm"`;
const errStatusCode = 500;

describe('validateAuthorizerData(data)', () => {
  it('throws without data', () => {
    try {
      validateAuthorizerData();
    } catch (err) {
      expect(err).toHaveProperty('message', 'Missing authorizer data');
      expect(err).toHaveProperty('details', errDetails);
      expect(err).toHaveProperty('statusCode', errStatusCode);
    }
  });

  it('throws with missing user ID', () => {
    try {
      validateAuthorizerData({});
    } catch (err) {
      expect(err).toHaveProperty('message', 'Missing user id');
      expect(err).toHaveProperty('details', errDetails);
      expect(err).toHaveProperty('statusCode', errStatusCode);
    }
  });

  it('throws with missing workspace ID', () => {
    try {
      validateAuthorizerData({ userId: '1' });
    } catch (err) {
      expect(err).toHaveProperty('message', 'Missing workspace id');
      expect(err).toHaveProperty('details', errDetails);
      expect(err).toHaveProperty('statusCode', errStatusCode);
    }
  });

  it('does not throw with valid format', () => {
    try {
      validateAuthorizerData({ userId: '1', workspaceId: '1' });
    } catch (err) {
      expect(err).toBe(null);
    }
  });
});
