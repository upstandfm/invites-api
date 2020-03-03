'use strict';

const createController = require('.');

describe('Controller', () => {
  describe('createController(invite, options)', () => {
    it('throws without an invite service', () => {
      expect(() => {
        createController();
      }).toThrowError(/^Provide an invite service$/);
    });

    it('throws without JSON body parser', () => {
      expect(() => {
        const fakeInviteService = {};
        const options = {
          bodyParser: {
            json: undefined
          },
          res: {
            json: () => undefined
          }
        };
        createController(fakeInviteService, options);
      }).toThrowError(/^Provide a body parser function to parse JSON strings$/);
    });

    it('throws when JSON body parser is not a function', () => {
      expect(() => {
        const fakeInviteService = {};
        const options = {
          bodyParser: {
            json: 1
          },
          res: {
            json: () => undefined
          }
        };
        createController(fakeInviteService, options);
      }).toThrowError(/^Provide a body parser function to parse JSON strings$/);
    });

    it('throws without JSON response handler', () => {
      expect(() => {
        const fakeInviteService = {};
        const options = {
          bodyParser: {
            json: () => undefined
          },
          res: {
            json: undefined
          }
        };
        createController(fakeInviteService, options);
      }).toThrowError(/^Provide a function to send JSON responses$/);
    });

    it('throws when JSON response handler is not a function', () => {
      expect(() => {
        const fakeInviteService = {};
        const options = {
          bodyParser: {
            json: () => undefined
          },
          res: {
            json: 'hello'
          }
        };
        createController(fakeInviteService, options);
      }).toThrowError(/^Provide a function to send JSON responses$/);
    });

    it('creates controller', () => {
      expect(() => {
        const fakeInviteService = {};
        const options = {
          bodyParser: {
            json: () => undefined
          },
          res: {
            json: () => undefined
          }
        };
        createController(fakeInviteService, options);
      }).not.toThrowError();
    });
  });
});
