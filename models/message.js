'use strict';
module.exports = function (sequelize, DataTypes) {
    var Message = sequelize.define('Message', {
        message_body: {
            type: DataTypes.STRING,
            notEmpty: true,
            allowNull: false
        },
        sender: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        receiver: {
            type: DataTypes.STRING,
            allowNull: false
        },
        receiver_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        message_type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'channel'
        }
    });
    return Message;
};