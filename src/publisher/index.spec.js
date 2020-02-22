'use strict';

const createPublisher = require('.');

describe('Publisher service', () => {
  describe('createPublisher(client)', () => {
    it('throws without a client', () => {
      expect(() => {
        createPublisher();
      }).toThrowError(/^Provide a messaging client/);
    });
  });
});
