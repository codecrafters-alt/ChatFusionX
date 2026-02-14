const chatModel = require("../models/chat.models");
async function createChat(req, res) {
  const { title } = req.body;
  const user = req.user; //from authenticate user middleware
  //create a new chat
  const chat = await chatModel.create({
    user: user._id,
    title,
  });

  return res.status(201).json({
    message: "chat created successfully",
    chat: {
      id: chat._id,
      title: chat.title,
      lastMessage: chat.lastMessage,
    },
    user: chat.user,
  });
}
module.exports = { createChat };
