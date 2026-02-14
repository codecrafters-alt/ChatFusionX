const express=require('express');
const router=express.Router();
//any user can create his chat after login
const {authenticateUser}=require('../middlewares/auth.middlewares');
const {createChat}=require('../controllers/chat.controllers');
router.post('/',authenticateUser,createChat);
module.exports=router;