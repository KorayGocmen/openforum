'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('Channels', 'messageIds', 'message_ids');
  },

  down: function (queryInterface, Sequelize) {
  }
};
