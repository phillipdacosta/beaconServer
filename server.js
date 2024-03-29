#!/usr/bin/env

// server.js
const appCollection = "no_context_users";
const cors = require("cors");

const express = require("express");
require("dotenv").config();
const http = require("http");
const errorhandler = require("errorhandler");
const helmet = require("helmet");
const logger = require("morgan");
const secrets = require("./secret");
const awsController = require("./aws-controller");
const fs = require("fs");
const MongoClient = require("mongodb").MongoClient;
//CREATE EXPRESS APP
const app = express();
app.use(helmet());
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const BodyParser = require("body-parser");
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

const multipart = require("connect-multiparty");
const multipartMiddleware = multipart({ uploadDir: "./" });
var ObjectId = require("mongodb").ObjectID;
const httpServer = require("http").createServer(app);

const io = require("socket.io")(httpServer, {
  cors: { origin: "*" },
});

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(cors({origin:true,credentials: true}));

if ("production" === "development") {
  app.use(logger("dev"));
  app.use(errorhandler());
}

app.get("/aws/sign", awsController.signedRequest);
app.get("/aws/files", awsController.listFiles);
app.get("/aws/files/:fileName", awsController.getFileSignedRequest);
app.delete("/aws/files/:fileName", awsController.deleteFile);

// io.on('connection', (socket) => {
//   socket.on('join', (data)=>{
//   

//     socket.join(data.room);
//     var roomy = data.room;
//     var emailJoinedRoom = data.email
//    
//   // 
//     socket.to(roomy).emit(`${emailJoinedRoom} user joined`);
//     if(data.room === roomy){
//      
//       collection = database.collection("travelbugdata");
//       collection.find({ 'email' : emailJoinedRoom}).toArray(function (err, response) {
//        
//         if(response[0]?.userObject?.notifications?.length > 0){
//          
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
//      
//       response[0].topics?.map((topics)=>{
//         if(topics.uuid === roomy){
//          
//           if(topics?.seenByUsers?.includes(emailJoinedRoom)){
//            

//           } else {
//             collection = database.collection("cityForum");
//            
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
//  

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
//    
//    //
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
//    

//     var usrTag = {
//       'chatroom' : chatroom,
//       'notifications' : false,
//       'city' : data.city,
//       'country': data.country
//     }
//     collection.find()
//     data.taggedUsers.map((taggedusers)=>{
//  //    collection.find({ 'email' : taggedusers.userEmail}).toArray(function (err, response) {
//   

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
//    
//     const isPull = likeData.isPull;
//     const chat_room = likeData.chatRoom
//    
//     collection = database.collection("cityForum");
//     if(isPull){
//       delete likeData.isPull;
//      
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
//              
//               io.emit("like", message_objects);
//               likeData.likedBy = []
//               message_objects = []
//             }
//           }))

//         })
//       })
//     } else {
//      
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
//              
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
//    
//     const isPull = likeTopicData.isPull;
//     const chat_room = likeTopicData.chatRoom
//    
//     collection = database.collection("cityForum");
//     if(isPull){
//       delete likeTopicData.isPull;
//      
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
//              
//               io.emit("likeTopic", likeTopic_objects);
//               likeTopicData.likedBy = []
//               likeTopic_objects = []
//             }
//           }))

//         })
//       })
//     } else {
//      
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
//              
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

//    
//    
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
//      
//       collection = database.collection("cityForum");
//       collection.updateOne({'city': (city), "country": country}, {
//               '$push':
//               {
//                 'topics': topicWithMessage,
//               }

//             }).then(result =>{
//              
//               collection.find({ 'city': (city), "country": country }).toArray(function (err, response) {
//                
//                 io.emit('saveTopic', response)

//               })
//             })
//           })

//   })

//   socket.on('leaveRoom', data => {
//    
//    
//     //socket.leave([data]);
//     //socket.removeAllListeners('join');

//     socket.to(data).emit(data + 'user left');

//   });

//   socket.on('error', function () {
//    
//     socket.socket.reconnect();
// });
// });

app.get("/getChatData", (request, res) => {
  const city = request.query.city;
  const country = request.query.country;
  collection = database.collection(appCollection);

  collection
    .find({ city: city, country: country })
    .toArray(function (err, response) {
     

      res.status(200).send({
        result: response,
      });
    });
});

// app.post("/uploadProfilePicture", multipartMiddleware, (request, response) => {
//   collection = database.collection(appCollection);

//   cloudinary.uploader
//     .upload(request.files.image.path, {
//       format: "png",
//       public_id: request.body.public_id,
//     })
//     .then((result) => {
//       collection
//         .updateOne(
//           { _id: ObjectId(result.public_id) },
//           {
//             $set: {
//               "userObject.userProfileImg": result.secure_url,
//             },
//           }
//         )
//         .then((result) => {}),
//         response.status(200).send({
//           message: "success",
//           result,
//         });
//     })
//     .catch((error) => {
//       response.status(500).send({
//         message: "failure",
//         error,
//       });
//     });
// });

app.get("/getMyDataFromDB", (req, res) => {
 
  const userEmailForDatabase = req.query.email;
  collection = database.collection(appCollection);
  collection.findOne({ email: userEmailForDatabase }, function (err, result) {
    if (err) throw err;
   console.log(result)
    res.status(200).send(result);
  });
});

app.get("/getAllUsers", (req, res) => {
 
  const myUserId = req.query.myUserId;
  collection = database.collection(appCollection);
  collection
    // remove my user from the returned list.
    // .find({ _id: { $nin: [ObjectId(myUserId)] } })
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
     
      res.status(200).send(
       result,
      );
    });
});

io.on("connection", (socket) => {
  // send a message to the client
 



  // here
  // collection
  //   .updateOne(
  //     { _id: ObjectId(userData._id) },
  //     {
  //       $push: { followers: myData },
  //     }
  //   )
  //   .then(() => {
  //     collection
  //       .updateOne(
  //         { _id: ObjectId(myData._id) },
  //         {
  //           $push: { following: userData },
  //         }
  //       )
  //       .then((result) => {
  //         collection
  //           .find({ _id: ObjectId(myData._id,) })
  //          // .toArray(function (err, response) {
  //            
  //             //io.emit('followUser',response[0])
  //             //io.emit('followUser',response[0]);
  //             io.emit("followUser", response[0]);
  // });
  //});
  // });

  // to here

  socket.on("unFollowUser", (myData, userData) => {
   
    socket.broadcast.emit("bye");
    const roomId = userData._id;
    socket.join(roomId);
   

   
   
    collection = database.collection(appCollection);
    collection
      .updateOne(
        { _id: ObjectId(userData._id) },
        {
          $pull: { followers: { _id: myData._id } },
        }
      )
      .then(() => {
        collection
          .updateOne(
            { _id: ObjectId(myData._id) },
            {
              $pull: { following: { _id: userData._id } },
            }
          )
          .then((result) => {
            collection
              .find({ _id: ObjectId(myData._id) })
              .toArray(function (err, response) {
               
                // io.emit('unFollowUser',response[0])
                //io.emit('unFollowUser',response[0]);
                io.emit("unFollowUser", response[0]);
              });
          });
      });
  });
});
//    socket.on('disconnect', () => {
//  
// });
//});

app.post("/checkIfUserExists", (req, res) => {
 
  var userEmailForDatabase = req.body.email;
  var userObject = {
    email: req.body.email,
    isRegistered: false,
    followers: [],
    following: [],
    username: "",
  };
  collection = database.collection(appCollection);
  collection
    .find({ email: { $in: [userEmailForDatabase] } })
    .toArray(function (err, response) {
      if (response?.length !== 0) {
        res.status(200).send({
          response: response[0],
        });
      } else {
       
        collection.insertOne(userObject, function (error, response) {
          if (error) {
           
            return false;
          }
          var responseObject = {
            _id: response?.insertedId,
            email: userObject?.email,
            isRegistered: userObject?.isRegistered,
            followers: userObject.followers,
            following: userObject.following,
            username: userObject.username,
          };
          res.status(200).send({
            response: responseObject,
          });
        });
      }
    });
});

app.post("/updateProfile", (req, res) => {
 
  const userEmailForDatabase = req.body.email;
  const updatedUsername = req.body.username;

  collection = database.collection(appCollection);
  collection.findOneAndUpdate(
    { email: { $eq: userEmailForDatabase } },
    { $set: { isRegistered: true, username: updatedUsername } },
    { returnDocument: "after", upsert: true },
    function (err, result) {
      if (err) throw err;
      res.status(200).send(result.value.isRegistered);
    }
  );
});

app.post("/followUser", async (req, res) => {
 

  const { myData, userToFollow, followText } = req.body;
  console.log('BANG', req.body)
  collection = database.collection(appCollection);

   if(followText === 'Follow'){

   
  const matchingIds = [ObjectId(myData._id), ObjectId(userToFollow._id)];
  const updates = [
    {
      updateOne: {
        filter: { _id: ObjectId(myData._id) },
        update: { $push: { following: userToFollow } },
      },
    },
    {
      updateOne: {
        filter: { _id: ObjectId(userToFollow._id) },
        update: { $push: { followers: myData } },
      },
    },
  ];
  collection.bulkWrite(updates).then((result) => {
    if (result.modifiedCount === 2) {
      collection
        .find({ _id: { $in: matchingIds } })
        .toArray()
        .then((updatedUsers) => {
          res.status(200).send(updatedUsers);
        });
    } else {
      res.status(500).send({ error: "Could not follow user" });
    }
  });
} else {
  const matchingIds = [ObjectId(myData._id), ObjectId(userToFollow._id)];
 
  try {

    // Update the following and followers arrays for both users
    const result = await collection.bulkWrite([
      {
        updateOne: {
          filter: { _id: ObjectId(myData._id) },
          update: { $pull: { following: { _id: userToFollow._id } } },
        },
      },
      {
        updateOne: {
          filter: { _id: ObjectId(userToFollow._id) },
          update: { $pull: { followers: { _id: myData._id } } },
        },
      },
    ]);
    // Check that both updates were successful
    if (result.modifiedCount === 2) {
      // Find the updated documents
      const updatedUsers = await collection.find({ _id: { $in: matchingIds } }).toArray();
      res.status(200).send(updatedUsers);
    } else {
      res.status(500).send({ error: "Could not unfollow user" });
    }
  } catch (error) {
    // Log any errors that occurred during the bulkWrite operation
    console.error(error);
    res.status(500).send({ error: "Could not unfollow user" });
  }
}
});

// app.post("/unfollowUser", async (req, res) => {
 

//   const { myData, userToUnFollow } = req.body;
//   collection = database.collection(appCollection);
//   const matchingIds = [ObjectId(myData._id), ObjectId(userToUnFollow._id)];
 
//   try {

//     // Update the following and followers arrays for both users
//     const result = await collection.bulkWrite([
//       {
//         updateOne: {
//           filter: { _id: ObjectId(myData._id) },
//           update: { $pull: { following: { _id: userToUnFollow._id } } },
//         },
//       },
//       {
//         updateOne: {
//           filter: { _id: ObjectId(userToUnFollow._id) },
//           update: { $pull: { followers: { _id: myData._id } } },
//         },
//       },
//     ]);
//     // Check that both updates were successful
//     if (result.modifiedCount === 2) {
//       // Find the updated documents
//       const updatedUsers = await collection.find({ _id: { $in: matchingIds } }).toArray();
//       res.status(200).send(updatedUsers);
//     } else {
//       res.status(500).send({ error: "Could not unfollow user" });
//     }
//   } catch (error) {
//     // Log any errors that occurred during the bulkWrite operation
//     console.error(error);
//     res.status(500).send({ error: "Could not unfollow user" });
//   }
// });




app.use(express.static("public"));

httpServer.listen(
  process.env.MONGOLAB_URI ||
    process.env.MONGODB_URI ||
    process.env.PORT ||
    5001,
  () => {
    const DATABASE_NAME = "no_context";
    const CONNECTION_URL = `mongodb+srv://phillipdacosta:database12@cluster0-8s0vf.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority`;
    console.log("connected")
    MongoClient.connect(
      CONNECTION_URL,
      { useNewUrlParser: true },
      (error, client) => {
        if (error) {
          throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection(DATABASE_NAME);

       
      }
    );
  }
);
