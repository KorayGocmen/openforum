'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('Channels', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            messageIds: {
                type: Sequelize.ARRAY(Sequelize.INTEGER),
                defaultValue: []
            },
            messages: {
                type: Sequelize.ARRAY(Sequelize.TEXT),
                defaultValue: []
            },
            contributors: {
                type: Sequelize.ARRAY(Sequelize.INTEGER),
                defaultValue: []
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('Channels');
    }
};