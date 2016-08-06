var express = require('express');
var Sequelize = require('sequelize');
var chalk = require('chalk');
var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
var secrets = require('../secrets');
var babel = require('babel-register');
var babelNode = require('babel-preset-node5');

var connectionString;
if (process.env.NODE_ENV === 'production') {
    connectionString = global.productionConnectionString;
} else {
    connectionString = global.localConnectionString;
}
var sequelize = new Sequelize(connectionString);
var app = express();
var router = express.Router();

// Importing the models
var User    = sequelize.import('../models/user');
var Message = sequelize.import('../models/message');
var Channel = sequelize.import('../models/channel');

// Send a message
router.post('/', async function (req, res, next) {
    try {
        var auth_token = req.get("Authorization");
        var receiver_name = req.body.receiver_name;
        var message_body = req.body.message_body;
        var message_type = req.body.message_type;

        const sender = await User.findOne({
            where:{
                auth_token: auth_token
            }
        });
        if(sender == null){
            var errorMessage = ["User not authorized or not found"];
            res.status(401).json({
                success: false,
                errors: errorMessage
            });
            return
        }
        if(!sender.dataValues.verified){
            var errorMessage = ["User email is not verified"];
            res.status(412).json({
                success: false,
                errors: errorMessage
            });
            return
        }

        // Check if the message body is empty
        if((message_body==null || (message_body.length===0 || !message_body.trim()))){
            var errorMessage = ['Message body cannot be empty'];
            res.status(422).json({
                success: false,
                errors: errorMessage
            });
            return
        }

        if(message_type==null || (message_type.length===0 || !message_type.trim()) || !(message_type == 'channel' || message_type == 'personal')){
            var errorMessage = ['Message type cannot be empty or different than \'personal\' or \'channel\''];
            res.status(422).json({
                success: false,
                errors: errorMessage
            });
            return
        }


        var sender_name = sender.dataValues.name;
        if(sender_name == null){
            sender_name = sender.dataValues.email;
        }

        var sender_id = sender.dataValues.id;
        var receiver;

        var new_message_array_style = [];
        new_message_array_style.push(sender_name);
        new_message_array_style.push(message_body);

        var previousChannel = true;

        if(message_type == 'channel'){
            // Message was sent to a channel
            receiver = await Channel.findOne({
               where:{
                   name: receiver_name
               }
            });

            if(receiver == null){
                // No previous channel
                var contributors = [];
                contributors.push(sender_id);
                receiver = await Channel.create({
                    name: receiver_name,
                    contributors: contributors
                });
                previousChannel = false;
            }

        }else{
            // Message was sent to a person
            receiver = null;
        }

        var new_message = await Message.create({
            message_body: message_body,
            sender: sender_name,
            sender_id: sender_id,
            receiver: receiver.dataValues.name,
            receiver_id: receiver.dataValues.id,
            message_type: message_type
        });

        if(message_type == 'channel' && !previousChannel) {
            var messages = [];
            var message_ids = [];
            messages.push(new_message_array_style);
            message_ids.push(new_message.dataValues.id);
            await receiver.update({
                messages: messages,
                message_ids: message_ids
            });
            var sender_channels = sender.dataValues.channels;

            var channelsInclude = false;
            for(var i=0; i<sender_channels.length; i++){
                if(sender_channels[i] == receiver_name){
                    channelsInclude = true;
                }
            }

            if(channelsInclude){
                // not messaged to this channel before
                sender_channels.push(receiver_name);
                await sender.update({
                    channels: sender_channels
                });
            }
        }else if(message_type == 'channel' && previousChannel){
            var messages = receiver.dataValues.messages;
            var message_ids = receiver.dataValues.message_ids;
            messages.push(new_message_array_style);
            message_ids.push(new_message.dataValues.id);
            await receiver.update({
                messages: messages,
                message_ids: message_ids
            });
            var sender_channels = sender.dataValues.channels;
            var channelsInclude = false;
            for(var i=0; i<sender_channels.length; i++){
                if(sender_channels[i] == receiver_name){
                    channelsInclude = true;
                }
            }

            if(channelsInclude){
                // not messaged to this channel before
                sender_channels.push(receiver_name);
                await sender.update({
                    channels: sender_channels
                });
            }
        }

        res.status(201).json({
            success: true,
            message: new_message
        });

    } catch (err) {
        console.log(chalk.red(err));
        var errorsMessageArray = [];
        for (var i = 0; i < err.errors.length; i++) {
            errorsMessageArray.push(err.errors[i].message);
        }
        res.status(422).json({
            success: false,
            errors: errorsMessageArray
        });
    }
});

module.exports = router;