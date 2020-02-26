'use strict';

const createStorage = require('./storage');
const createInvites = require('./invites');
const createController = require('./controller');

module.exports = {
  createStorage,
  createInvites,
  createController
};
