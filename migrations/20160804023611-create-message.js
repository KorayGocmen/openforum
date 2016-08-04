'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('Messages', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            message_body: {
                type: Sequelize.STRING,
                allowNull: false
            },
            sender: {
                type: Sequelize.STRING,
                allowNull: false
            },
            sender_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            receiver: {
                type: Sequelize.STRING,
                allowNull: false
            },
            receiver_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            message_type: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'channel'
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
        return queryInterface.dropTable('Messages');
    }
};