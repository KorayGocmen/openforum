# Open Forum API
---

## Developed by Koray Gocmen, August 2016
---


This is the official documentation for Open Forum API, developed on Node.js. This documentation includes schemas, tables and detailed examples of how to use the routes.

Open Forum API is hosted on Heroku and can be reached at (*end point here*)

Any changes will be noted in the changelog below.

This markdown file can be read in any markdown viewer such as  [Dillinger.io](http://dillinger.io/).

##API Details
This section defines the models used inside the API. Explanations of the model attributes will be explained in the matching sections

* **USER** - A user is anyone that can use the app. User's have: *auth_token/email/name/password/channels/admin*

* **MESSAGE** - A message is a text send between two users or from a user to a channel.
A message has: *message_body/sender/sender_id/receiver/receiver_id/message_type*.
 
* **CHANNEL** - A channel is any public channel where all users are allowed to send messages. Every venue and event have a channel and any user can message to the channel. It is a "group chat" for any venue/event/etc.
A channel has: *name/message_ids/messages/contributors*

Every API response have an attribute calles **success** which is a boolean. If the wished API call is successful, success attribute is true, otherwise it is false. If the API call is not successful an errors array containing possible error messages.

---

#Security
* All API calls have to be over ssl secured connection with **https**
* User passwords are never saved as plain text. Saved as encrypted
* API is secured with JSON Web Tokens (JWT). Auth token is created with two level of security. It is created as a random string seeded with a random value.

---
## API Specifications
Below we will detail the models listed above, and the available API endpoints for each model.

---

---

## Current User Model
      
      auth_token: {
          type: DataTypes.STRING,
          defaultValue: ""
      },
      email: {
          type: DataTypes.STRING,
          allowNull: false,
          contains:'@metu.edu.tr',
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

---

* **auth_token**: Authentication token, which will be used to access to different parts of the API, such as sending a message etc. Auth token will be generated after the user logs in and destroyed when user logs out.

* **email**: Validates if it is not a real email address. There is no email verification at the moment. Can not be null, has to be unique and has to contain '@metu.edu.tr'.

* **name**: User's name has to be unique.

* **password**: Password can not be null and stored encrypted in the database.

* **channels**: Channels is an array containing all the channel names, user messaged before.

* **admin**: Default false, admins have access to some restricted parts of the API.

---

## USER - User Create

###Usage:

*[POST]* Request - **no auth_token needed**. https://open-forum-api.herokuapp.com/api/users

`
curl -v -H "Content-type: application/json" -X POST open-forum-api.herokuapp.com/users/ -d '{"email":"test1@test.com", "name":"test1", "password":"123456"}'
`

> This will create a user in the database. When creating a user you have to provide an email, a name and a password.
---

* Success: Returns HTTP 201 + User (see below)

`
{"success":true,"user":{"auth_token":"","channels":[],"id":2,"email":"test1@test.com","name":"test1","password":"$2a$10$AlTR3u3FRmTltGttYkPMfeebf3QuwSmWYxIyA9zNvRdVHmxVJHTEK","admin":false,"updatedAt":"2016-08-04T19:54:58.630Z","createdAt":"2016-08-04T19:54:58.630Z"}}
`

* Failure: Returns a JSON blob with reason for error (see below)

`
{"success":false,"errors":["email must be unique"]}
`

---

## USER - User Login

###Usage:

*POST* Request - **no auth_token needed**. http://open-forum-api.herokuapp.com/users/login

`
curl -v -H "Content-type: application/json" -X POST open-forum-api.herokuapp.com/users/login -d '{"email":"test1@test.com", "password":"123456"}'
`

> This will log the user in and return the auth_token to access other parts of the API.
---

* Success: Returns HTTP 200 + Auth Token

`
{"success":true,"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOjIsImp0aSI6MC4xMzE0MDMzNjM1NDI2MzEyN30.cYWWtD3yLPUDKFmNcZ-EZScFljxySxlRJjJR_Zpr_Go"}
`

* Failure: Returns a JSON blob with reason for error

`
{"success":false,"errors":["Password is wrong"]}
`
or
`
{"success":false,"errors":["User not found"]}
`

---

## USER - User Logout

###Usage:

*POST* Request - **auth_token needed**. http://open-forum-api.herokuapp.com/users/logout

`
curl -v -H "Content-type: application/json" -H "Authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOjIsImp0aSI6MC4xMzE0MDMzNjM1NDI2MzEyN30.cYWWtD3yLPUDKFmNcZ-EZScFljxySxlRJjJR_Zpr_Go" -X POST open-forum-api.herokuapp.com/users/logout -d ''
`

> Logout a user. Destroy his auth_token
---

* Success: Returns HTTP 200

`
{"success":true}
`

* Failure: Returns a JSON blob with reason for error

`
{"success":false,"errors":["User not authorized"]}
`

---

---

## Current Message Model

      message_body: {
          type: DataTypes.STRING,
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
          
---

* **message_body**: The string that contains the message text. (can not be null)
* **sender**: Name of the user who sent the message. (can not be null)
* **sender_id**: Id of the user who sent the message. (can not be null)
* **receiver**: Name of the user who is going to receive the message. (can not be null)
* **receiver_id**: Id of the user who is going to receive the message. (can not be null)
* **message_type**: Type of message. Personal message type is 'personal', channel message type is 'channel'. (can not be null)(default is 'channel')

---

## MESSAGE - Send Message

###Usage:

*POST* Request. **auth_token needed** http://open-forum-api.herokuapp.com/messages

`
curl -v -H "Content-Type: application/json" -H "Authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOjIsImp0aSI6MC4yNDYyNzEyNDQwMTc0MDczfQ.nF7KW2fAK8QZPbuDeS1aVp4__2zZnFfROkFjEXNeBp8" -X POST "http://open-forum-api.herokuapp.com/messages" -d '{"receiver_name":"ACE", "message_body":"This is a second message","message_type":"channel"}'                                                                                                                                                                                                                                                            
`

> Send a message. message_body, receiver_name and message_type can not be null. This call creates a new channel if it doesn't exist. If a channel does exist, new message is added to the channel
---

* Success: Returns HTTP 200 + Message Details

`
{"success":true,"message":{"id":5,"message_body":"This is a second message","sender":"test1","sender_id":2,"receiver":"ACE","receiver_id":1,"message_type":"channel","updatedAt":"2016-08-04T20:19:02.245Z","createdAt":"2016-08-04T20:19:02.245Z"}}
`

* Failure: Returns a JSON blob with reason for error

`
{"success":false,"errors":["User not authorized"]}
`
or
`
{"success":false,"errors":["Message body cannot be empty"]}
`
or
`
{"success":false,"errors":["Message type cannot be empty or different than 'personal' or 'channel'"]}
`

---

---

## Current Channel Model

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
          
---

* **name**: Name of the channel. (can not be null)(has to be unique)
* **message_ids**: Ids of the messages in this channel.
* **messages**: Messages in the channel
* **contributors**: Ids of the users who has messaged to this channel before

---

## CHANNEL - Get User's Channels

###Usage:

*GET* Request. **auth_token needed** http://open-forum-api.herokuapp.com/channels

`
curl -v -H "Content-Type: application/json" -H "Authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOjIsImp0aSI6MC4yNDYyNzEyNDQwMTc0MDczfQ.nF7KW2fAK8QZPbuDeS1aVp4__2zZnFfROkFjEXNeBp8" -X GET "http://open-forum-api.herokuapp.com/channels"                                                                                                                                 
`

> Get all the channels user has messaged before
---

* Success: Returns HTTP 200 + Channels Details

`
{"success":true,"channels":[{"channel_id":7,"channel_name":"ACE","message_ids":[6,7,11],"messages":[["test1@email.com","This is a message"],["test1@email.com","This is a second message"],["test1@email.com","This is a second message"]]},{"channel_id":8,"channel_name":"Amsterdam","message_ids":[8],"messages":[["test1@email.com","Amsterdam message"]]},{"channel_id":9,"channel_name":"Some Other Bar","message_ids":[9],"messages":[["test1@email.com","other bar message"]]},{"channel_id":10,"channel_name":"One more","message_ids":[10],"messages":[["test1@email.com","one more message"]]},{"channel_id":7,"channel_name":"ACE","message_ids":[6,7,11],"messages":[["test1@email.com","This is a message"],["test1@email.com","This is a second message"],["test1@email.com","This is a second message"]]}]}
`

* Failure: Returns a JSON blob with reason for error

`
{"success":false,"errors":["User not authorized or not found"]}
`

---

## CHANNEL - Get All Channels

###Usage:

*GET* Request. **auth_token needed** http://open-forum-api.herokuapp.com/channels/all

`
curl -v -H "Content-Type: application/json" -H "Authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOjIsImp0aSI6MC4yNDYyNzEyNDQwMTc0MDczfQ.nF7KW2fAK8QZPbuDeS1aVp4__2zZnFfROkFjEXNeBp8" -X GET "http://open-forum-api.herokuapp.com/channels/all"                                                                                                                                 
`

> Get all the channels. Only returns the names of all available channels. This route is designed to only show the names of the channels
---

* Success: Returns HTTP 200 + Channels Details

`
{"success":true,"channels":[{"channel_id":1,"channel_name":"ACE"},{"channel_id":2,"channel_name":"Amsterdam"}]}
`

* Failure: Returns a JSON blob with reason for error

`
{"success":false,"errors":["User not authorized or not found"]}
`

---

## CHANNEL - Get One Channel with Id or Name

###Usage:

*GET* Request. **auth_token needed** http://open-forum-api.herokuapp.com/channels/:id_or_name

`
curl -v -H "Content-Type: application/json" -H "Authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOjIsImp0aSI6MC4yNDYyNzEyNDQwMTc0MDczfQ.nF7KW2fAK8QZPbuDeS1aVp4__2zZnFfROkFjEXNeBp8" -X GET "http://open-forum-api.herokuapp.com/channels/ACE"                                                                                                                                 
`
or
`
curl -v -H "Content-Type: application/json" -H "Authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOjIsImp0aSI6MC4yNDYyNzEyNDQwMTc0MDczfQ.nF7KW2fAK8QZPbuDeS1aVp4__2zZnFfROkFjEXNeBp8" -X GET "http://open-forum-api.herokuapp.com/channels/1" 
`

> Get a channel with it's name or it's id. In the messages array of the response: first index = Sender Name(or email if they didn't provide a name), second index = Message Body
---

* Success: Returns HTTP 200 + Channel's Details

`
{"success":true,"channel":{"channel_id":1,"channel_name":"ACE","message_ids":[1,2,3,4,5],"messages":[["test1@email.com","This is a message"],["test1@email.com","This is a message"],["test1@email.com","This is a message"],["test1@email.com","This is a second message"],["test1","This is a second message"]],"contributor_ids":[1]}}
`

* Failure: Returns a JSON blob with reason for error

`
{"success":false,"errors":["User not authorized or not found"]}
`
or
`
{"success":false,"errors":["Channel not found"]}
`

---

---

##Changelog

* Wrote the first draft. 04/08/2016

---