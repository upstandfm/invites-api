'use strict';

const createStorage = require('./storage');

describe('Storage service', () => {
  describe('createStorage(client, tableName)', () => {
    it('throws without a client', () => {
      expect(() => {
        createStorage();
      }).toThrowError(/^Provide a storage client$/);
    });

    it('throws without a table name', () => {
      expect(() => {
        const fakeClient = {};
        createStorage(fakeClient);
      }).toThrowError(/^Provide a table name$/);
    });

    it('creates the service', () => {
      expect(() => {
        const fakeClient = {};
        const fakeTable = 'Fake';
        createStorage(fakeClient, fakeTable);
      }).not.toThrowError();
    });
  });
});
