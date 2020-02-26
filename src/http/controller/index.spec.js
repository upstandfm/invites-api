'use strict';

const createController = require('.');

describe('Controller', () => {
  describe('createController(invites, options)', () => {
    it('throws without an invites service', () => {
      expect(() => {
        createController();
      }).toThrowError(/^Provide an invites service$/);
    });

    it('throws without JSON body parser', () => {
      expect(() => {
        const fakeInvitesService = {};
        const options = {
          bodyParser: {
            json: undefined
          },
          res: {
            json: () => undefined
          }
        };
        createController(fakeInvitesService, options);
      }).toThrowError(/^Provide a body parser function to parse JSON strings$/);
    });

    it('throws when JSON body parser is not a function', () => {
      expect(() => {
        const fakeInvitesService = {};
        const options = {
          bodyParser: {
            json: 1
          },
          res: {
            json: () => undefined
          }
        };
        createController(fakeInvitesService, options);
      }).toThrowError(/^Provide a body parser function to parse JSON strings$/);
    });

    it('throws without JSON response handler', () => {
      expect(() => {
        const fakeInvitesService = {};
        const options = {
          bodyParser: {
            json: () => undefined
          },
          res: {
            json: undefined
          }
        };
        createController(fakeInvitesService, options);
      }).toThrowError(/^Provide a function to send JSON responses$/);
    });

    it('throws when JSON response handler is not a function', () => {
      expect(() => {
        const fakeInvitesService = {};
        const options = {
          bodyParser: {
            json: () => undefined
          },
          res: {
            json: 'hello'
          }
        };
        createController(fakeInvitesService, options);
      }).toThrowError(/^Provide a function to send JSON responses$/);
    });

    it('creates controller', () => {
      expect(() => {
        const fakeInvitesService = {};
        const options = {
          bodyParser: {
            json: () => undefined
          },
          res: {
            json: () => undefined
          }
        };
        createController(fakeInvitesService, options);
      }).not.toThrowError();
    });
  });
});
