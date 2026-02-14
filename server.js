require('dotenv').config();
const app=require('./src/app');
const connectToDB=require('./src/db/db');
connectToDB();
const {initSocketServer}=require('./src/sockets/socket.server');
const {createServer}=require('http');
const httpServer=createServer(app);
initSocketServer(httpServer);
const port=3006;
httpServer.listen(port,()=>{
  console.log(`Server is running on http://localhost:${port}`);
})
//we are not using normalexpress server we need http server for socket.io 
