'use strict';

const createStorageService = require('./storage-service');
const createInviteService = require('./invite-service');
const createController = require('./controller');

module.exports = {
  createStorageService,
  createInviteService,
  createController
};
