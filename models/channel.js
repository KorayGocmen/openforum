'use strict';
module.exports = function(sequelize, DataTypes) {
  var Channel = sequelize.define('Channel', {
      name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
      },
      message_ids: {
          type: DataTypes.ARRAY(DataTypes.INTEGER),
          defaultValue: []
      },
      messages: {
          type: DataTypes.ARRAY(DataTypes.TEXT),
          defaultValue: []
      },
      contributors: {
          type: DataTypes.ARRAY(DataTypes.INTEGER),
          defaultValue: []
      }
  });
  return Channel;
};