'use strict';

/**
 * Create Invites service.
 *
 * @param {Object} db - Storage service
 *
 * @return {Object} Invites service interface
 */
module.exports = function createInvites(db) {
  if (!db) {
    throw new Error('Provide a storage service');
  }

  return {
    /**
     * Create a workspace invite.
     *
     * @param {String} workspaceId
     * @param {String} userId
     * @param {Object} data
     *
     * @return {Promise} Resolves with created invite
     */
    create(workspaceId, userId, data) {
      const now = new Date().toISOString();
      const item = {
        ...data,
        workspaceId,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        status: 'pending'
      };

      return db.insertWorkspaceInvite(item);
    },

    /**
     * Get all workspace invites.
     *
     * @param {String} workspaceId
     *
     * @return {Promise} Resolves with all invites
     */
    getAll(workspaceId) {
      return db.queryWorkspaceInvites(workspaceId);
    }
  };
};
