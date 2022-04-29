//dev - mayank kushwaha

var express = require("express");
const cors = require("cors");
var app = express();
app.use(cors());
var http = require("http").createServer(app);
var io = require("socket.io")(http,{
  cors:{
    origin: "*",
    methods: ["GET", "POST"]
  }
});

var server_port = process.env.PORT || 3000;
const onchat = [];
var onpd;

app.use(express.static(__dirname + "/public"));
app.use('/scripts', express.static(__dirname + '/node_modules/'));
app.get("/", function (req, res) {res.sendFile(__dirname + "/chat.html");});

io.on("connection", function (socket) {
  console.log(socket.id + " Online!!!");
  onchat.push(socket.id);
  onpd = onchat.length;
  io.emit("onp", onpd);

  socket.on("disconnect", function () {
    console.log(socket.id + " Disconnected!!!");
    var userid = onchat.indexOf(socket.id);
    onchat.splice(userid, 1);
    onpd = onchat.length;
    io.emit("onp", onpd);
  });

  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  socket.on("base64", function (msgdata) {
    console.log("image file from > " + msgdata.uname);
    socket.broadcast.emit("base64", msgdata);
  });

  socket.on("transmit_message", function (msg) {
    console.log(socket.id + " : " + msg);
    socket.broadcast.emit("recive_message", msg);
  });

  socket.on("typing", (data) => {
    io.emit("display", data);
  });
});

http.listen(server_port, function () {
  console.log("localhost:" + server_port);
});
