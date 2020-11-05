
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var noOfRooms=0;
var noOfVRooms=0;
var rooms=[];
var vRooms=[];
var songList=["baby doll","chikini chameli","despacito","saree ke fall sa"];

app.use(express.static('public'));



app.get('/room1', (req, res) => {
  res.sendFile(__dirname+'/public/room1.html');
});

app.get('/room2', (req, res) => {
  res.sendFile(__dirname+'/public/room2.html');
});

app.get('/audioRoom',(req,res)=>{
  console.log(req.query.newRoom);
  res.sendFile(__dirname+'/public/audioRoom.html');
})

app.get('/index', (req, res) => {
  res.sendFile(__dirname+'/public/index.html');
});

app.get('/search', (req, res) => {
  res.sendFile(__dirname+'/public/searchApi.html');
});

app.get('/song',(req,res)=>{
  let searchKey=req.query.searchKey;
  let responseList=[];
  for(let song of songList){
    if(song.indexOf(searchKey)>-1){
      responseList.push(song);
    }
  }
  res.send(responseList);
});

io.on("connection",(socket)=>{
    console.log("A user connected");
    var currentRoom;

    socket.on('join',function(roomName){
      socket.join(roomName);
      console.log("joining room: ",roomName);
      for(let i=0;i<rooms.length;i++){
        if(rooms[i].roomId==roomName){
          socket.emit("roomObjDetails",rooms[i]); //To send room object for joined user.
        }
      }
      socket.to(roomName).emit('roomMessage',"User joined room: "+roomName);
    });

    socket.on('joinVRoom',function(vRoomName){
      socket.join(vRoomName);
      console.log("joining video room: ",vRoomName);
      for(let i=0;i<vRooms.length;i++){
        if(vRooms[i].roomId==vRoomName){
         
          // console.log(currentPlayingTime);
          // vRooms[i].currentTime=currentPlayingTime;
          socket.emit("vRoomObjDetails",vRooms[i]); 
          
        }
      }
      socket.to(vRoomName).emit('roomMessage',"User joined room: "+vRoomName);
    });


    socket.on('createRoom',(getRoomNo)=>{
      // noOfRooms++;
      
      let roomObj={
        roomId:noOfRooms+1,
        song:"Aathangara.mp3",
        currentTime:0,
        playing:false
      };
      rooms.push(roomObj)
    
      let roomName=rooms[noOfRooms].roomId;
      currentRoom=roomName;
      socket.join(roomName);
      console.log(`The room ${roomName} created`);
      socket.emit("roomObjDetails",roomObj);   //To send room object to the created user.
      noOfRooms++;
      getRoomNo(roomName);
      // socket.emit('createRoomLink',roomName);
      // socket.emit('availableRooms',rooms);
    });

    socket.on('createVideoRoom',()=>{
      // noOfRooms++;
      
      let vRoomObj={
        roomId:noOfVRooms+1,
        videoId:-1,
        currentTime:0,
        playing:false
      };
      vRooms.push(vRoomObj)
    
      let vRoomName=vRooms[noOfVRooms].roomId;
      // currentRoom=vRoomName;
      socket.join(vRoomName);
      console.log(`The  video room ${vRoomName} created`);
      socket.emit("vRoomObjDetails",vRoomObj);   //To send room object to the created user.
      noOfVRooms++;
      // getRoomNo(roomName);
      // socket.emit('createRoomLink',roomName);
      // socket.emit('availableRooms',rooms);
    });

    socket.on('getCurrentRoom',()=>{
      socket.emit('currentRoom',currentRoom);
    });

    socket.on('getRooms',()=>{
      console.log("get rooms called");
      socket.emit('availableRooms',rooms,vRooms);
      
    });



    socket.on('changeSongReq',(roomNo,reqSong)=>{
      
      console.log(reqSong);
      let resSong=reqSong+".mp3";
      console.log(resSong);
      io.to(roomNo).emit('changeSongRes',resSong);

      

      console.log(`changeSongReq and changeSongRes called for room : ${roomNo}`);
    });

    socket.on('changePlayTime',(roomNo,changedPlayTime)=>{
      console.log("change play time called for room ",roomNo);
      socket.to(roomNo).emit('changePlayTimeRes',changedPlayTime);
    });

    socket.on('changeVideoReq',function(obj){
      let roomId=obj.roomId;
      let videoId=obj.videoId;
      console.log("change video request called");
      for(let i=0;i<vRooms.length;i++){
        if(vRooms[i].roomId==roomId){
          vRooms[i].videoId=videoId;
          socket.to(roomId).emit("changeVideoRes",videoId); 
          console.log("change video response called");
        }
      }
      
    });

    socket.on('videoPlaying',function(vRoomId,time){
      socket.to(vRoomId).emit('videoPlayingRes',time);
    });

    socket.on('videoPaused',function(vRoomId,time){
      socket.to(vRoomId).emit('videoPausedRes',time);
    });

    socket.on("playerReady",function(vRoomId){
      socket.to(vRoomId).emit("pauseAndPlay");
    });

    
    
    
});



http.listen(3000, () => {
  console.log('listening on *:3000');
});
