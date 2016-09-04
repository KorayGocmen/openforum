/*
 * Developed by Koray Gocmen,
 * August, 2016
 * */

var express     = require('express');
var Sequelize   = require('sequelize');
var chalk       = require('chalk');
var bcrypt      = require('bcrypt');
var jwt         = require('jwt-simple');
var babel       = require('babel-register');
var babelNode   = require('babel-preset-node5');
var Config      = require('../config/config.json');

var connectionString;
if (process.env.NODE_ENV === 'production'){
    connectionString = Config.productionConnectionString;
}else{
    connectionString = Config.localConnectionString;
}
var sequelize = new Sequelize(connectionString);
var app = express();
var router = express.Router();

// Importing the models
var User    = sequelize.import('../models/user');
var Channel = sequelize.import('../models/channel');

// Get the channel user has messaged
router.get('/', async function (req,res,next) {
    try{
        var auth_token = req.get("Authorization");
        const user = await User.findOne({
            where:{
                auth_token: auth_token
            }
        });
        if(user == null){
            var errorMessage = ["User not authorized or not found"];
            res.status(404).json({
                success: false,
                errors: errorMessage
            });
            return
        }
        if(!user.dataValues.verified){
            var errorMessage = ["User email is not verified"];
            res.status(412).json({
                success: false,
                errors: errorMessage
            });
            return
        }

        var user_channels = user.dataValues.channels;
        var channelMessages = [];
        for(var i=0; i<user_channels.length; i++){
            var messages = await Channel.findOne({
                where:{
                    name:user_channels[i]
                },
                attributes:[['id','channel_id'], ['name','channel_name'], 'message_ids', 'messages']
            });
            channelMessages.push(messages);
        }

        res.status(200).json({
            success: true,
            channels: channelMessages
        });

    }catch(err){
        console.log(chalk.red(err));
        var errorsMessageArray = [];
        for(var i=0; i<err.errors.length; i++){
            errorsMessageArray.push(err.errors[i].message);
        }
        res.status(422).json({
            success: false,
            errors: errorsMessageArray
        });
    }
});

// Get all the channels
router.get('/all', async function(req,res,next){
    try {
        var auth_token = req.get("Authorization");
        const user = await User.findOne({
            where: {
                auth_token: auth_token
            }
        });
        if (user == null) {
            var errorMessage = ["User not authorized or not found"];
            res.status(404).json({
                success: false,
                errors: errorMessage
            });
            return
        }
        if(!user.dataValues.verified){
            var errorMessage = ["User email is not verified"];
            res.status(412).json({
                success: false,
                errors: errorMessage
            });
            return
        }

        const allChannels = await Channel.findAll({
            attributes: [['id','channel_id'], ['name','channel_name']]
        });

        res.status(200).json({
            success:true,
            channels:allChannels
        });

    }catch(err){
        console.log(chalk.red(err));
        var errorsMessageArray = [];
        for(var i=0; i<err.errors.length; i++){
            errorsMessageArray.push(err.errors[i].message);
        }
        res.status(422).json({
            success: false,
            errors: errorsMessageArray
        });
    }
});

// Get channel with specific id or name
router.get('/:id_or_name', async function(req,res,next){
    try {
        var auth_token = req.get("Authorization");
        const user = await User.findOne({
            where: {
                auth_token: auth_token
            }
        });
        if (user == null) {
            var errorMessage = ["User not authorized or not found"];
            res.status(404).json({
                success: false,
                errors: errorMessage
            });
            return
        }
        if(!user.dataValues.verified){
            var errorMessage = ["User email is not verified"];
            res.status(412).json({
                success: false,
                errors: errorMessage
            });
            return
        }

        var id_or_name = req.params.id_or_name;
        var channel_return;

        if(!isNaN(id_or_name)){
            channel_return = await Channel.findOne({
                where:{
                    id: id_or_name
                },
                attributes: [['id','channel_id'],['name','channel_name'],'message_ids','messages',['contributors','contributor_ids']]
            });
        }else{
            channel_return = await Channel.findOne({
                where:{
                    name: id_or_name
                },
                attributes: [['id','channel_id'],['name','channel_name'],'message_ids','messages',['contributors','contributor_ids']]
            });
        }

        if(channel_return == null){
            var errorMessage = ["Channel not found"];
            res.status(404).json({
                success: false,
                errors: errorMessage
            });
            return
        }

        res.status(200).json({
            success: true,
            channel: channel_return
        });

    }catch(err){
        console.log(chalk.red(err));
        var errorsMessageArray = [];
        for(var i=0; i<err.errors.length; i++){
            errorsMessageArray.push(err.errors[i].message);
        }
        res.status(422).json({
            success: false,
            errors: errorsMessageArray
        });
    }
});


module.exports = router;