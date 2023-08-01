// let socketio = {};
const createIo = (server) => {
  global.io = require("socket.io")(server, {
    cors: {
      origins: [
        "http://localhost:3000",
        "https://rockie-stockalertclient.herokuapp.com",
        "https://trusting-austin-bb7eb7.netlify.app",
      ],
    },
  }); //https://socket.io/docs/v2/handling-cors/
  /*上方為此寫法的簡寫：
          const socket = require('socket.io')
          const io = socket(server)
        */

  //監聽 Server 連線後的所有事件，並捕捉事件 socket 執行
  global.io.on("connection", (socket) => {
    //經過連線後在 console 中印出訊息
    console.log("success connect!");
    /*
            //只回傳給發送訊息的 client
            socket.on('getMessage', message => {
                socket.emit('getMessage', message)
            })

            //回傳給所有連結著的 client
            socket.on('getMessageAll', message => {
                io.sockets.emit('getMessageAll', message)
            })

            //回傳給除了發送者外所有連結著的 client
            socket.on('getMessageLess', message => {
                socket.broadcast.emit('getMessageLess', message)
            })
        */
    socket.on("addRoom", (room) => {
      /*
            //加入前檢查是否已有所在房間
            const nowRoom = Object.keys(socket.rooms).find(room => {
                return room !== socket.id
            })
            //有的話要先離開
            if (nowRoom) {
                socket.leave(nowRoom)
            }
            */
      //再加入新的
      if (!io.sockets.adapter.rooms.has(room)) {
        //since socket.io change io.sockets.adapter.rooms from object to map
        socket.join(room);
      }
    });

    socket.on("leaveRoom", (room) => {
      if (io.sockets.adapter.rooms.has(room)) {
        socket.leave(room);
      }
    });

    //送出中斷申請時先觸發此事件
    socket.on("disConnection", (message) => {
      //再送訊息讓 Client 做 .close()
      socket.emit("disConnection", "");
    });

    //client中斷後觸發此監聽
    socket.on("disconnect", () => {
      console.log("disconnection");
    });
  });
};

// class SocketIO {
//   io = undefined;
//   constructor() {
//     this.io = undefined;
//   }
//   get io() {
//     console.log(this.io)
//     return this.io;
//   }
//   createIo(server) {
//     this.io = require("socket.io")(server, {
//       cors: {
//         origins: [
//           "http://localhost:3000",
//           "https://rockie-stockalertclient.herokuapp.com",
//           "https://trusting-austin-bb7eb7.netlify.app",
//         ],
//       },
//     });
//     console.log(this.io)
//     this.io.on("connection", (socket) => {
//       console.log("success connect!");
//       socket.on("addRoom", (room) => {
//         if (!io.sockets.adapter.rooms.has(room)) {
//           //since socket.io change io.sockets.adapter.rooms from object to map
//           socket.join(room);
//         }
//       });

//       socket.on("leaveRoom", (room) => {
//         if (io.sockets.adapter.rooms.has(room)) {
//           socket.leave(room);
//         }
//       });

//       //送出中斷申請時先觸發此事件
//       socket.on("disConnection", (message) => {
//         //再送訊息讓 Client 做 .close()
//         socket.emit("disConnection", "");
//       });

//       //client中斷後觸發此監聽
//       socket.on("disconnect", () => {
//         console.log("disconnection");
//       });
//     });
//   }
// }

module.exports = createIo
