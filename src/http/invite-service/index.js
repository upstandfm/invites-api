'use strict';

/**
 * Create invite service.
 *
 * @param {Object} db - Storage service
 *
 * @return {Object} Invite service interface
 */
module.exports = function createInviteService(db) {
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
     * @param {String} data.email
     * @param {String} data.inviterFullName
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
     * Update the status of a workspace invite.
     *
     * @param {Object} data
     * @param {String} data.workspaceId
     * @param {String} data.email
     * @param {String} data.status
     *
     * @return {Promise} Resolves with updated invite attributes
     */
    updateStatus(data) {
      const item = {
        updatedAt: new Date().toISOString(),
        status: data.status
      };

      return db.updateWorkspaceInviteStatus(data.workspaceId, data.email, item);
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
