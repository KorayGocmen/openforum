var express     = require('express');
var Sequelize   = require('sequelize');
var chalk       = require('chalk');
var bcrypt      = require('bcrypt');
var jwt         = require('jwt-simple');
var secrets     = require('../secrets');
var babel       = require('babel-register');
var babelNode   = require('babel-preset-node5');

var connectionString;
if (process.env.NODE_ENV === 'production'){
  connectionString = global.productionConnectionString;
}else{
  connectionString = global.localConnectionString;
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
        var encryptedPassword = bcrypt.hashSync(plainPassword, 10);

        const createdUser = await User.create({
            email: req.body.email,
            name: req.body.name,
            password: encryptedPassword,
            admin: false
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
            var errorMessage = ["User not authorized"];
            res.status(401).json({
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
