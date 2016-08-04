'use strict';
module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('User', {
        auth_token: {
            type: DataTypes.STRING,
            defaultValue: ""
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        name: {
            type: DataTypes.STRING,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        channels: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            defaultValue: []
        },
        admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
    return User;
};