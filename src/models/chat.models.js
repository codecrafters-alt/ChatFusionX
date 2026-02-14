const mongoose=require('mongoose');
const chatSchema=new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',
    required:true
  },
  title:{
    type:String,
    required:true
  },
  lastMessage:{
    type:Date,
    default:Date.now
  }
},{
    timestamps:true  //chat creation time and updation last time will be stored/maintained in the database
  })

const chatModel=mongoose.model('chat',chatSchema);
module.exports=chatModel;
