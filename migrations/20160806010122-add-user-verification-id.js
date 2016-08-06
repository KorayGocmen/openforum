'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.addColumn('Users','verification_id',{
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue: 0
      });
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.removeColumn('Users','verification_id');
  }
};
