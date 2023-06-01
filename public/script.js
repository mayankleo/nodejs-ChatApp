//dev - mayank kushwaha
var uname = "null";
if (localStorage.getItem("Name") === null) {
  setname();
}
uname = localStorage.getItem("Name");
var socket;
var curl;
var recidata;
var ssss = document.getElementById("mdisplay");
window.onload = function () {
  socket = io.connect("https://milo-chat.onrender.com");
 // socket = io.connect("http://localhost:3000");
  socket.on("recive_message", function (msg) {
    var html =
      '<div><div class="message omessage">' +
      msg +
      '</div><div class="separator"></div></div>';
    var sss = document.getElementById("mainmess");
    sss.innerHTML += html;
    ssss.scrollTop = ssss.scrollHeight;
  });

  socket.on("base64", function (msgdata) {
    var html =
      '<div><div class="message omessage"><h4>' +
      msgdata.uname +
      '</h4><img src="' +
      msgdata.file +
      '" style="max-width: 100%;object-fit:cover;height:250px;"/></div><div class="separator"></div></div>';
    var sss = document.getElementById("mainmess");
    sss.innerHTML += html;
    ssss.scrollTop = ssss.scrollHeight;
  });

  socket.on("display", function (data) {
    if (uname != data.user) {
      if (data.typing == true) {
        document.getElementById("ty").innerText =
          data.user + ": Typing...";
        ssss.scrollTop = ssss.scrollHeight;
      } else {
        document.getElementById("ty").innerHTML = "";
      }
    }
  });
  socket.on("onp",function(onpd){
        console.log(onpd);
        document.getElementById("op").innerText=onpd;
      });
};

function sendMessage() {
  if (uname != "null") {
    typingTimeout();
    var message = document.getElementById("typingbox").value;
    if (message != "") {
      var html =
      '<div><div class="message mymessage">' +
      message +
      '</div><div class="separator"></div></div>';
      document.getElementById("typingbox").value = "";
      var sss = document.getElementById("mainmess");
      sss.innerHTML += html;
      ssss.scrollTop = ssss.scrollHeight;
      socket.emit("transmit_message", uname + ": " + message);
    }
  } else setname();
}

var input = document.getElementById("typingbox");
input.addEventListener("keydown", function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById("bt").click();
  }
});

function typingTimeout() {
  typing = false;
  socket.emit("typing", { user: uname, typing: false });
}
var timeout;
function keydown(e) {
  var keynum;
  if (window.event) {
    keynum = e.keyCode;
  } else if (e.which) {
    keynum = e.which;
  }
  if (keynum) {
    typing = true;
    socket.emit("typing", { user: uname, typing: true });
    clearTimeout(timeout);
    timeout = setTimeout(typingTimeout, 2000);
  } else {
    clearTimeout(timeout);
    typingTimeout();
  }
}
function setname() {
  if (uname != "null") {
    let stat = confirm(
      "You current user name is " + uname + ", DO YOU WANT TO CHANGE IT ?"
    );
    if (stat == false) {
      return;
    }
  }
  let inname = prompt("Type your name here");
  if (inname == "") {
    alert("Pls enter name!!!");
    setname();
  } else {
    localStorage.setItem("Name", inname);
    uname = localStorage.getItem("Name");
  }
}

function filesend(fname) {
  var msgdata = {};
  var parts = fname.split(".");
  fname = parts[parts.length - 1].toLowerCase();
  const data = document.getElementById("sfile").files[0];
  var imagesenddata;
  async function handleImageUpload() {
    const options = {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 1080,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(data, options);
      var copratio = (1 - compressedFile.size / data.size) * 100;
      imagesenddata = compressedFile;
    } catch (error) {
      console.log(error);
    }

    var reader = new FileReader();
    msgdata.uname = uname;
    reader.onloadend = function () {
      msgdata.file = reader.result;
      if (
        fname == "jpg" ||
        fname == "jpeg" ||
        fname == "ico" ||
        fname == "gif" ||
        fname == "png"
      ) {
        var html =
          '<div><div class="message mymessage"><h4>' +
          msgdata.uname +
          '</h4><br><img src="' +
          msgdata.file +
          '" style="max-width: 100%;object-fit:cover;height:250px;"/><br><h5>' +
          Math.round(copratio) +
          '% compressed</h5></div><div class="separator"></div></div>';
        var sss = document.getElementById("mainmess");
        sss.innerHTML += html;
        ssss.scrollTop = ssss.scrollHeight;
        socket.emit("base64", msgdata);
      } else {
        alert("file not supported!!!");
      }
    };
    reader.readAsDataURL(imagesenddata);
  }
  handleImageUpload();
}
