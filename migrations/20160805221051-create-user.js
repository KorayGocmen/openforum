'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('Users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            auth_token: {
                type: Sequelize.STRING,
                defaultValue: ""
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                contains:'@metu.edu.tr',
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            name: {
                type: Sequelize.STRING,
                unique: true
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            channels: {
                type: Sequelize.ARRAY(Sequelize.TEXT),
                defaultValue: []
            },
            admin: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
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
        return queryInterface.dropTable('Users');
    }
};