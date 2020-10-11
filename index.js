
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var noOfRooms=0;
var rooms=[];
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
      socket.to(roomName).emit('roomMessage',"User joined room: "+roomName);
    });

    socket.on('createRoom',(getRoomNo)=>{
      noOfRooms++;
      rooms.push(noOfRooms);
      let roomName=noOfRooms;
      currentRoom=roomName;
      socket.join(roomName);
      console.log(`The room ${roomName} created`);
      getRoomNo(roomName);
      // socket.emit('createRoomLink',roomName);
      // socket.emit('availableRooms',rooms);
    });

    socket.on('getCurrentRoom',()=>{
      socket.emit('currentRoom',currentRoom);
    });

    socket.on('getRooms',()=>{
      socket.emit('availableRooms',rooms);
    });

    socket.on('changeSongReq',(roomNo,reqSong)=>{
      
      console.log(reqSong);
      let resSong=reqSong+".mp3";
      console.log(resSong);
      io.to(roomNo).emit('changeSongRes',resSong);

      

      console.log(`changeSongReq and changeSongRes called for room : ${roomNo}`);
    })

    socket.on('changePlayTime',(roomNo,changedPlayTime)=>{
      console.log("change play time called for room ",roomNo);
      socket.to(roomNo).emit('changePlayTimeRes',changedPlayTime);
    })
    
    
    
});



http.listen(3000, () => {
  console.log('listening on *:3000');
});
