'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.addColumn('Users','verification_id',{
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: ''
      });
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.removeColumn('Users','verification_id');
  }
};
