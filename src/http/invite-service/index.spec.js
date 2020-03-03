'use strict';

const createInviteService = require('.');

describe('Invites service', () => {
  describe('createInviteService(db)', () => {
    it('throws without storage service', () => {
      expect(() => {
        createInviteService();
      }).toThrowError(/^Provide a storage service$/);
    });

    it('creates invite service', () => {
      expect(() => {
        const fakeStorage = {};
        createInviteService(fakeStorage);
      }).not.toThrowError();
    });
  });

  describe('inviteService.create(workspaceId, userId, data)', () => {
    it('calls storage service with item', async () => {
      const fakeStorage = {
        insertWorkspaceInvite: jest.fn(() => Promise.resolve())
      };
      const inviteService = createInviteService(fakeStorage);
      const workspaceId = '1zxE3D2';
      const userId = 'user|5656ea6a6f64124df123fd';
      const data = {
        email: 'test.user@test.com',
        inviterFullName: 'Test Inviter'
      };
      await inviteService.create(workspaceId, userId, data);

      // Check if we call the storage service
      expect(fakeStorage.insertWorkspaceInvite.mock.calls.length).toEqual(1);

      // Check if the storage service is called with correct item data
      const input = fakeStorage.insertWorkspaceInvite.mock.calls[0][0];

      expect(input.email).toEqual(data.email);
      expect(input.inviterFullName).toEqual(data.inviterFullName);
      expect(input.workspaceId).toEqual(workspaceId);
      expect(input.createdBy).toEqual(userId);

      // ISO date looks like: "2020-02-23T15:27:05.825Z"
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(input.createdAt).toEqual(expect.stringMatching(isoDateRegex));
      expect(input.updatedAt).toEqual(expect.stringMatching(isoDateRegex));

      expect(input.status).toEqual('pending');
    });
  });

  describe('inviteService.getAll(workspaceId)', () => {
    it('calls storage service with workspace ID', async () => {
      const fakeStorage = {
        queryWorkspaceInvites: jest.fn(() => Promise.resolve())
      };
      const inviteService = createInviteService(fakeStorage);
      const workspaceId = '1zxE3D2';
      await inviteService.getAll(workspaceId);

      // Check if we call the storage service
      expect(fakeStorage.queryWorkspaceInvites.mock.calls.length).toEqual(1);

      // Check if the storage service is called with correct item data
      const input = fakeStorage.queryWorkspaceInvites.mock.calls[0][0];
      expect(input).toEqual(workspaceId);
    });
  });
});
