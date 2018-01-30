var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var winston = require('winston');
var onlineClients = 0;
var thisRank;

// Config Values
// managed server-side
var configRecordChat = true;
var configServerDisabled = false;
var configRunRanks = false;
var chatFilter = true;
/////////

// Ban List System
function checkBanList(n) {
  if(n == "Banned") {
    return false;
  }
  else if(n == "Jesus") {
    return false;
  }
  else {
    return true;
  }
}

// Create our Log File
 var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'ServerLogs.log' })
    ]
  });


// When clients connect, send them our main html page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get("/send", (req, res) => {  
    console.log(req.query);
    res.send(req.query);
});

// Gets called when a user connects
io.on('connection', function(socket){
  console.log("[System]: New Connection from address: '" + socket.handshake.address + "'");
  onlineClients = onlineClients + 1;
  //broadcastSystemMessage("A User has joined the room.", "Users");
});

io.on('disconnect', function() {
  console.log("[System]: User Disconnection");
  onlineClients = onlineClients - 1;
});


io.on('sendToAll', function(username, txt) {
  io.emit('chat message', username + " " + txt);
});
// Broadcast the Message to all clients connected
io.on('connection', function(socket){
  socket.on('chat message', function(msg, username, rank, channel){
    console.log("Chat> Message Recieved: " + msg + " on channel " + channel);
    var filteredMessage = filterInputAsync(msg);
    var filteredName = filterInputAsync(username, "Name");
    if(filteredMessage == "") {
      return;
    }
    if(filteredName == "") {
      return;
    }
    var whatToSend = "[" + rank + "] " + username + ": " + filteredMessage;
    io.emit('messageSend', whatToSend, channel);
    logger.info('Chat> (' + username + '): ' + filteredMessage);
    console.log('Chat> (' + username + '): ' + filteredMessage);
  });
});


io.on('rawMessage', function(msg, sender) {
  io.emit('messageSend', sender + " " + msg);
});


// Atticus' Massive Ultimate Chat Filter
// This thing is flawless ;)
function filterInputAsync(msg, type) {
  if(chatFilter == false) {
    return msg;
  }
  if(msg.toLowerCase().indexOf("fuck") >=0 || msg.toLowerCase().indexOf("fuc") >=0 || msg.toLowerCase().indexOf("piss") >=0 ||
     msg.toLowerCase().indexOf("dick") >=0 || msg.toLowerCase().indexOf("a$$") >=0 || msg.toLowerCase().indexOf("pussy") >=0 ||
     msg.toLowerCase().indexOf("tit") >=0 || msg.toLowerCase().indexOf("kkk") >=0 || msg.toLowerCase().indexOf("twat") >=0 ||
     msg.toLowerCase().indexOf("whore") >=0 || msg.toLowerCase().indexOf("f|_|ck") >=0 || msg.toLowerCase().indexOf("a**") >=0 ||
     msg.toLowerCase().indexOf("ass") >=0 || msg.toLowerCase().indexOf("cock") >=0 || msg.toLowerCase().indexOf("shit") >=0 ||
     msg.toLowerCase().indexOf("cunt") >=0 || msg.toLowerCase().indexOf("nigg") >=0 || msg.toLowerCase().indexOf("fag") >=0 ||
     msg.toLowerCase().indexOf("bitch") >=0 || msg.toLowerCase().indexOf("f u c k") >=0 || msg.toLowerCase().indexOf("fook") >=0 ||
     msg.toLowerCase().indexOf("5hit") >=0 || msg.toLowerCase().indexOf("sh1t") >=0 || msg.toLowerCase().indexOf("5h17") >=0 || 
     msg.toLowerCase().indexOf("@ss") >=0) {
    logger.info('Anti Swear> This user tried to use the string: ' + msg);
    console.log('Anti Swear> This user tried to use the string: ' + msg);
    return "*FilteredWord*";
  }
  else {
    if(type == "Name") {
      if(msg.indexOf("[") >=0 || msg.indexOf("]") >=0) {
        logger.info('Anti Swear> This user tried to use the string: ' + msg);
        console.log('Anti Swear> This user tried to use the string: ' + msg);
        return "*FilteredWord*";
      }
      else {
        return msg;
      }
    }
    else {
      return msg;
    }
  }
}

var username;


// Staff Ranks
/*
- Owner
- Leader
- Dev
- Admin
- Sr. Mod
- Mod
- Trainee


// Donor Ranks

- Eternal
- Titan
- Legend
- Hero
- Ultra

*/


// Start up the server
http.listen(3000, function(){
  console.log('Core> System Ready! Listening on Port 3000');
});

// Broadcast a system message to all users
io.on('sendSystemMessage', function(message, sender) {
  io.emit('chat message', sender + '> ' + message);
});

io.on('consoleAlert', function(message) {
  console.log('[System]: ' + message);
});

function isAdmin(user) {
  if(user == "Angus") {
    return true;
  }
  else {
    return false;
  }
}