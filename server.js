#!/usr/bin/env

// server.js
const appCollection = 'no_context_users';
const cors = require('cors');
const express = require('express');
require("dotenv").config();
const http  = require('http');
const errorhandler = require('errorhandler');
const helmet = require('helmet');
const logger = require('morgan');
const secrets = require('./secret');
const awsController = require('./aws-controller');
const fs = require("fs");
const MongoClient = require("mongodb").MongoClient;
//CREATE EXPRESS APP
const app = express();
app.use(helmet())
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

const BodyParser = require("body-parser");
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

const  multipart  =  require('connect-multiparty');
const  multipartMiddleware  =  multipart({ uploadDir:  './' });
var ObjectId = require('mongodb').ObjectID;
const httpServer = require('http').createServer(app);

const io = require('socket.io')(httpServer, {
  cors: {origin : '*'}
});

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(cors({origin:true,credentials: true}));

if ("production" === 'development') {
  app.use(logger('dev'));
  app.use(errorhandler())
}

app.get('/aws/sign', awsController.signedRequest);
app.get('/aws/files', awsController.listFiles);
app.get('/aws/files/:fileName', awsController.getFileSignedRequest);
app.delete('/aws/files/:fileName', awsController.deleteFile);

  // const cloudinary = require("cloudinary").v2;
  //   // Cloudinary configuration
  // cloudinary.config({
  //   cloud_name: "podmilt",
  //   api_key: "454468872518962",
  //   api_secret: "5w5-0SURPqrxkPjnb_9FsrRLGnE",
  // });

  
  // io.on('connection', (socket) => {
  //   socket.on('join', (data)=>{
  //    console.log("JOINDATA- ",data)
      
  //     socket.join(data.room);
  //     var roomy = data.room;
  //     var emailJoinedRoom = data.email
  //     console.log(`${emailJoinedRoom} joined ${roomy}`)
  //   //  console.log(email, "joined")
  //     socket.to(roomy).emit(`${emailJoinedRoom} user joined`);
  //     if(data.room === roomy){
  //       console.log("else ran")
  //       collection = database.collection("travelbugdata");
  //       collection.find({ 'email' : emailJoinedRoom}).toArray(function (err, response) {
  //         console.log("PHILR", response)
  //         if(response[0]?.userObject?.notifications?.length > 0){
  //           console.log("else ran2..")
  //           collection = database.collection("travelbugdata");

  //           collection.updateOne({ 'email' : emailJoinedRoom}, 
  //           {
  //             "$set": {
  //               "userObject.notifications.$[current].notifications": true
  //             }
  //           },
  //           {
  //             "arrayFilters": [
  //               {
  //                 "current.chatroom": roomy
  //               }
  //             ]
    
  //           })
  //         }
  //         socket.to(roomy).emit(response);

  //       })

       
  //     }
     

  //     collection = database.collection("cityForum");
  //     if(roomy !== 'notificationsRoom' && roomy !== 'app' && roomy != 'forumDetailRoom'){

      
  //     collection.find({ 'topics.uuid' :roomy}).toArray(function (err, response) {
  //       console.log(response)
  //       response[0].topics?.map((topics)=>{
  //         if(topics.uuid === roomy){
  //           console.log("right room..")
  //           if(topics?.seenByUsers?.includes(emailJoinedRoom)){
  //             console.log("User already seen topic..")

              
  //           } else {
  //             collection = database.collection("cityForum");
  //             console.log("User HAS NOT seen topic..adding", emailJoinedRoom, "to" , roomy)
  //             collection.updateOne({'topics.uuid' : roomy}, {
  //               '$push':
  //               {
                 
  //                 "topics.$.seenByUsers" : emailJoinedRoom
  //               },  
            
  //             })
  //           }
          
  //         }
  //       })
       

  //     })  
  //   }
  //   });
  //   console.log('a user connected',);
 
  //   socket.on('message', (data) => {
  //     const messageObject = data;
  //       const user = data.user
  //       const chatUserName = data.chatUserName
  //       const IncomingMessage = data.message
  //       const city = data.city
  //       const country = data.country
  //       const chatroom = data.chatroom
  //       const timeSent = data.timeSent
  //       const uuid = data.uuid
  //       const profilePic = data.profilePic
  //       const taggedUsers = data.taggedUsers
  //     console.log("UUID, ",chatroom)
  //    // console.log("Incoming",data)
  //     // io.to(chatroom).emit('message', `${chatUserName} said ${message.message}`)
  //      io.to(data.chatroom).to('notificationsRoom').to('app').to('forumDetailRoom').emit("message", messageObject);


  //      collection = database.collection("cityForum");

  //     collection.updateOne({'city': (data.city), "country": data.country, 'topics.uuid' : chatroom}, {
  //       '$push':
  //       {
         
  //         "topics.$.messageObject" : messageObject
  //       },  
    
  //     })
  //     collection = database.collection("travelbugdata");
  //     console.log("TAGGED USERS ARRAY", data.taggedUsers)
    
  //     var usrTag = {
  //       'chatroom' : chatroom,
  //       'notifications' : false,
  //       'city' : data.city,
  //       'country': data.country
  //     }
  //     collection.find()
  //     data.taggedUsers.map((taggedusers)=>{
  //  //    collection.find({ 'email' : taggedusers.userEmail}).toArray(function (err, response) {
  //    console.log("THE TAGGED MFS", taggedusers)
    
  //        collection.updateOne({ 'email' : taggedusers.userEmail}, {
  //          '$push':
  //          {
            
  //            "userObject.notifications" : usrTag
  //          },  
       
  //        })
  //  //  })
  //      })
       

  //   });
    


  //   socket.on('like', (likeData) =>{
  //     console.log("likeData",likeData)
  //     const isPull = likeData.isPull;
  //     const chat_room = likeData.chatRoom
  //     console.log(likeData['comment-uuid'])
  //     collection = database.collection("cityForum");
  //     if(isPull){
  //       delete likeData.isPull;
  //       console.log('pulling...')
  //       var message_objects = []
        
  //       collection.updateOne({'city': (likeData.city), "country": likeData.country, 'topics.messageObject.uuid' : likeData['comment-uuid']},
  //        { 
  //          '$pull': { "topics.$.messageObject.$[x].likes" : likeData },
  //         },  
  //        { arrayFilters: [ { "x.uuid" : likeData['comment-uuid'] } ] 
      
  //       }).then((result)=>{
  //         collection = database.collection("cityForum");
  //         collection.find({ 'topics.messageObject.uuid' : likeData['comment-uuid']}).toArray(function (err, response) {
  
  //           response[0].topics.map((likeDataObject=>{
  //             if(likeDataObject.uuid === chat_room){
  //               message_objects.push(likeDataObject.messageObject)
  //               console.log("message_objects", message_objects)
  //               io.emit("like", message_objects);
  //               likeData.likedBy = []
  //               message_objects = []
  //             }
  //           }))
     
            
           
  //         })
  //       })
  //     } else {
  //       console.log('pushing...')
  //       var message_objects = []
  //       delete likeData.isPull;
  //       collection.updateOne({'city': (likeData.city), "country": likeData.country, 'topics.messageObject.uuid' : likeData['comment-uuid']},
  //        { 
  //          '$push': { "topics.$.messageObject.$[i].likes" : likeData }
  //          },  
  //        { arrayFilters: [ { "i.uuid" : likeData['comment-uuid'] } ] 
      
  //       }).then((result)=>{
  //         collection = database.collection("cityForum");
  //         collection.find({ 'topics.messageObject.uuid' : likeData['comment-uuid']}).toArray(function (err, response) {
  
  //           response[0].topics.map((likeDataObject=>{
  //             if(likeDataObject.uuid === chat_room){
  //               message_objects.push(likeDataObject.messageObject)
  //               console.log("message_objects", message_objects)
  //               io.emit("like", message_objects);
  //               likeData.likedBy = []
  //               message_objects = []
  //             }
  //           }))
     
            
           
  //         })
  //       })
  //     }
     

  //   })


  //   socket.on('likeTopic', (likeTopicData) =>{
  //     console.log("likeTopicData",likeTopicData)
  //     const isPull = likeTopicData.isPull;
  //     const chat_room = likeTopicData.chatRoom
  //     console.log("Liking Topic in", chat_room)
  //     collection = database.collection("cityForum");
  //     if(isPull){
  //       delete likeTopicData.isPull;
  //       console.log('pulling...')
  //       var likeTopic_objects = []
        
  //       collection.updateOne({'city': (likeTopicData.city), "country": likeTopicData.country, 'topics.uuid' : likeTopicData['topic-uuid']},
  //        { 
  //          '$pull': { "topics.$.topicLikes" : likeTopicData },
      
  //       }).then((result)=>{
  //       collection = database.collection("cityForum");
  //         collection.find({ 'topics.uuid' : likeTopicData['topic-uuid']}).toArray(function (err, response) {
  
  //           response[0].topics.map((likeDataObject=>{
  //             if(likeDataObject.uuid === chat_room){
  //               likeTopic_objects.push(likeDataObject)
  //               console.log("like_objects", likeTopic_objects)
  //               io.emit("likeTopic", likeTopic_objects);
  //               likeTopicData.likedBy = []
  //               likeTopic_objects = []
  //             }
  //           }))
            
     
            
           
  //         })
  //       })
  //     } else {
  //       console.log('pushing...')
  //       var likeTopic_objects = []
  //       delete likeTopicData.isPull;
  //       collection.updateOne({'city': (likeTopicData.city), "country": likeTopicData.country, 'topics.uuid' : likeTopicData['topic-uuid']},
  //        { 
  //          '$push': { "topics.$.topicLikes" : likeTopicData }

  //       }).then((result)=>{
  //         collection = database.collection("cityForum");
  //         collection.find({ 'topics.uuid' : likeTopicData['topic-uuid']}).toArray(function (err, response) {
  
  //           response[0].topics.map((likeDataObject=>{
  //             if(likeDataObject.uuid === chat_room){
  //               likeTopic_objects.push(likeDataObject)
  //               console.log("like_objects", likeTopic_objects)
  //               io.emit("likeTopic", likeTopic_objects);
  //               likeTopicData.likedBy = []
  //               likeTopic_objects = []
  //             }
  //           }))
     
            
           
  //         })
  //       })
  //     }
     

  //   })

  //   socket.on('saveTopic', data =>{
    
  //     console.log("Saving new topic", data)
  //     console.log(data)
  //     const city = data.city;
  //     const country = data.country;
  //     const topic = data.topic;
  //     const category = data.category;
  //     const details = data.details;
  //     const userObject = data.userObject;
  //     const postedTimestamp = data.postedTimestamp;
  //     const uuid = data.uuid;
  //     const seenByUsers = data.seenByUsers;
  //     var categoriesArray = [];
  //     var topicWithMessage = {
  //       'topic' : topic,
  //       'category' : category,
  //       'details' : details,
  //       'postedTimestamp' : postedTimestamp,
  //       'userObject' : userObject,
  //       'uuid' : uuid,
  //       'seenByUsers' : seenByUsers
  
  //     }
  //     collection = database.collection("cityForum");
  
  //     collection.find({ 'city': (city), "country": country }).toArray(function (err, response) {
  //       console.log("forum response1",response)
  //       collection = database.collection("cityForum");
  //       collection.updateOne({'city': (city), "country": country}, {
  //               '$push':
  //               {
  //                 'topics': topicWithMessage,
  //               }
                
  //             }).then(result =>{
  //               console.log(result)
  //               collection.find({ 'city': (city), "country": country }).toArray(function (err, response) {
  //                 console.log("updated response", response)
  //                 io.emit('saveTopic', response)
                 
  //               })
  //             })
  //           })

  //   })

  
  //   socket.on('leaveRoom', data => {
  //     console.log('a user left disconnected!');
  //     console.log("Leaving",data)
  //     //socket.leave([data]);
  //     //socket.removeAllListeners('join');
  
  //     socket.to(data).emit(data + 'user left');

  //   });


  //   socket.on('error', function () {
  //     console.log("Client: error");
  //     socket.socket.reconnect();
  // });
  // });



app.get("/getChatData", (request, res)=>{
  const city = request.query.city;
  const country = request.query.country;
  collection = database.collection(appCollection);

  collection.find({ 'city': (city), "country": country }).toArray(function (err, response) {
    console.log("forum response",response)

  res.status(200).send({
      result: response, 
    
        })
 
})
})





app.post("/uploadProfilePicture",multipartMiddleware, (request, response) => {
  collection = database.collection(appCollection);

  cloudinary.uploader.upload(request.files.image.path, {format: "png", public_id: request.body.public_id})
    .then((result) => {
      collection.updateOne({ '_id': ObjectId(result.public_id) }, {
        '$set':
        {
          'userObject.userProfileImg': result.secure_url,
        },
      }).then((result)=>{
      }),
      
      response.status(200).send({
        message: "success",
        result,
      });
    },
    
    ).catch((error) => {
      response.status(500).send({
        message: "failure",
        error,
      });
    });

});


app.post('/deleteProfilePicture',multipartMiddleware, (request, response) => {
  console.log("trying to delete picture...")
  collection = database.collection(appCollection);

  var public_id_for_deletion = request.body.userPublicId;
  cloudinary.uploader.destroy(public_id_for_deletion, {invalidate : true})
    .then((result) => {
      collection.updateOne({ '_id': ObjectId(public_id_for_deletion) }, {
        '$set':
        {
          'userObject.userProfileImg':'assets/placeholderProfilePic.png',
        },
      }).then((result)=>{
      }),
      response.status(200).send({
        message: "success",
        result,
      });
    }).catch((error) => {
      response.status(500).send({
        message: "failure",
        error,
      });
    });

});











app.get('/getAllUsernames', (req, res) => {
  var usernameArray = [];
  collection = database.collection(appCollection);
   collection.find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    result.map((username =>{
      console.log(username.userObject?.userName)
      username.userObject?.userName !== undefined ?  usernameArray.push(username.userObject?.userName) : '';
    }))
      res.status(200).send({
            usernameList: usernameArray
          })
   // database.close();
  });

})








app.post('/checkIfUserExists', (req, res) => {
  console.log('determining user...',req.body.email)
  var userEmailForDatabase = req.body.email;
  var userObject = {
    'email': req.body.email,
    'isRegistered': false
  }
  collection = database.collection(appCollection);
  collection.find({ email: { $in: [userEmailForDatabase] } }).toArray(function (err, response) {

    if (response?.length !== 0) {
          res.status(200).send({
            response: response[0]
          })

    } else {

      console.log('This user DOES NOT exist. Adding...')
      collection.insertOne(userObject, function (error, response) {
        if (error) {
          console.log('Error occurred while inserting');
           return false;
        } 
        var responseObject = {
          userId: response?.insertedId,
          email: userObject?.email,
          isRegistered: userObject?.isRegistered

        }
        res.status(200).send({
          response: responseObject    

        })
      })
    
    }
  })
})




app.use(express.static('public'))

httpServer.listen(process.env.MONGOLAB_URI || process.env.MONGODB_URI || process.env.PORT || 5001, () => {

  const DATABASE_NAME = "no_context";
  const CONNECTION_URL = `mongodb+srv://phillipdacosta:database12@cluster0-8s0vf.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority`;

  MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
    if (error) {
      throw error;
    }
    database = client.db(DATABASE_NAME);
    collection = database.collection(DATABASE_NAME);


    console.log("Connected to `" + DATABASE_NAME + "`!");
  });
});
