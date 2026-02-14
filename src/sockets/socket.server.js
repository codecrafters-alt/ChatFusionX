const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.models");
const { getAiResponse, generateVector } = require("../service/ai.service");
const messageModel = require("../models/message.models");
const { createMemory, queryMemory } = require("../service/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  //socket.io middleware
  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    if (!cookies.token) {
      next(new Error("Authentication error: Token not found"));
    }
    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET); //decoded contains user id
      const user = await userModel.findById({ _id: decoded.id });
      socket.user = user; //attach user data to socket object
      next(); //proceed to connection means io.on('connection')
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    // You can add more event listeners and emitters here as needed
    socket.on("ai-message", async (messagePayload) => {
      //one chat consists of multiple messages
      //Now we will get the particular chat's message and content of the message

      //first save the user message to the database
      const message = await messageModel.create({
        user: socket.user._id,
        chat: messagePayload.chatId,
        content: messagePayload.content,
        role: "user",
      });

      // //now we will convert user message to vector and store it in memory
      const text = messagePayload.content;
      const searchedMemory = await queryMemory({
        text,
        limit: 3,
        metadata: {
          user: String(socket.user._id),
          chat: String(messagePayload.chatId),
        },
      });
      console.log("Searched Memory:", searchedMemory);

      await createMemory({
        text,
        messageId: message._id,
        metadata: {
          user: socket.user._id,
          chat: messagePayload.chatId,
        },
      });

      // //chatHistory=short-term memory
      const chatHistory = (
        await messageModel
          .find({ chat: messagePayload.chatId })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
      ).reverse();
      //sort messages in descending reverse order of creation time like latest message will be at the top and then we will reverse it to get the original order of messages

      const stm = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      const memoryText = searchedMemory
        .map((item) => item.fields.text)
        .filter(Boolean)
        .map((text) => {
          return text
            .replace(/\*\*\*/g, "") // remove separators like ***
            .replace(/\*\*/g, "") // remove bold markdown
            .replace(/Your Question Counter:[\s\S]*/gi, "") // remove counter section
            .trim();
        })
        .join("\n\n");

      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `
You have access to previous relevant semantic memories from this user.

Use them only if they are directly relevant to the current query.
Do NOT continue previous conversations or repeat formatting.

${memoryText}
`,
            },
          ],
        },
      ];

      //here we will call the ai service to get the response
      const aiResponse = await getAiResponse([...ltm, ...stm]);

      //save the ai response to the database
      const responseMessage = await messageModel.create({
        user: socket.user._id,
        chat: messagePayload.chatId,
        content: aiResponse,
        role: "model",
      });

      //save the ai response to the vector database as well
      const text2 = aiResponse;
      await createMemory({
        text: text2,
        messageId: responseMessage._id,
        metadata: {
          user: socket.user._id,
          chat: messagePayload.chatId,
        },
      });

      socket.emit("ai-response", {
        chatId: messagePayload.chatId,
        content: aiResponse,
      });
    });
  });
}

module.exports = { initSocketServer };
