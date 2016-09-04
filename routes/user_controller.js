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
var nodemailer  = require('nodemailer');
var ver_email   = require('../public/javascripts/emails/ver_email');
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
var User = sequelize.import('../models/user');

// Create new user
router.post('/', async function(req,res,next) {
    try{
        var plainPassword = req.body.password;
        var user_email = req.body.email;
        var user_name = req.body.name;
        var encryptedPassword = bcrypt.hashSync(plainPassword, 10);
        var verification_id_string = Math.random().toString(18).substring(2);

        //Verification email authorization
        var smtpTransport = nodemailer.createTransport("SMTP",{
            service: Config.email.service,
            secure: true,
            auth: {
                user: Config.email.user,
                pass: Config.email.password
            }
        });

        const createdUser = await User.create({
            email: user_email,
            name: user_name,
            password: encryptedPassword,
            admin: false,
            verified: false,
            verification_id: verification_id_string
        });

        // Send verification email
        var link;
        if (process.env.NODE_ENV === 'production'){
            link = Config.host + '/users/verify/' + createdUser.dataValues.verification_id + '/' + user_email;
        }else{
            link = 'http://localhost:3000/users/verify/' + createdUser.dataValues.verification_id + '/' + user_email;
        }

        var email = ver_email.strVar1 + link + ver_email.strVar2;
        var mailOptions={
            to : user_email,
            from: Config.email.user,
            subject : "Verify your email address",
            html : email
        };

        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Message sent: " + response.message);
            }
        });

        var newUser = createdUser.dataValues;
        res.status(201).json({
            success: true,
            user: newUser
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

// Verify user email
router.get('/verify/:verification_id/:user_email', async function(req,res,next){
    try{
        var verification_id = req.params.verification_id;
        var user_email = req.params.user_email;

        var user = await User.findOne({
            where:{
                email: user_email
            }
        });

        if(user == null){
            var errorMessage = ["User not found"];
            res.status(404).json({
                success: false,
                errors: errorMessage
            });
            return
        }

        if(user.dataValues.verification_id != verification_id){
            // Someone is trying to hack
            // Change user's verification_id
            var new_verification_id = Math.random().toString(18).substring(2);
            await user.update({
                verification_id: new_verification_id
            });
            res.render('email_verification', {message: 'Something went wrong. Email verification failed.'});
            return
        }

        // All good. Verify the user
        await user.update({
            verified: true
        });

        res.render('email_verification', {message: 'Thank you for verifying your email!'});

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

// Login the user with username and password
// Get auth token
router.post('/login', async function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    try{
        const user = await User.findOne({
            where:{
                email: email
            }
        });
        if(user == null){
            var errorMessage = ["User not found"];
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

        if(!bcrypt.compareSync(password,user.password)){
            var errorMessage = ["Password is wrong"];
            res.status(401).json({
                success: false,
                errors: errorMessage
            });
            return
        }
        var random = Math.random();
        var token = jwt.encode({
            iss: user.id,
            jti: random
        }, global.jwtTokenSecret);

        await user.update({
            auth_token: token
        });

        res.status(200).json({
            success: true,
            token: token
        });

    } catch (err){
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

// Logout the user and destroy his auth token
router.post('/logout', async function (req,res,next) {
    try{
        var authToken = req.get("Authorization");
        const user = await User.findOne({
            where:{
                auth_token: authToken
            }
        });

        if(user == null){
            var errorMessage = ["User not authorized or not found"];
            res.status(401).json({
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

        await user.update({
            auth_token: ""
        });

        res.status(200).json({
            success:true
        });

    } catch(err){
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