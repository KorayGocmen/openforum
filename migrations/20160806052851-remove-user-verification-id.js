'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.removeColumn('Users','verification_id');
  },

  down: function (queryInterface, Sequelize) {
      return;
  }
};
