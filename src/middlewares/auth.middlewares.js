const userModel=require('../models/user.models');
const jwt=require('jsonwebtoken');
async function authenticateUser(req,res,next){
const {token}=req.cookies;
  if(!token){
      return res.status(401).json({message:"Unauthorized-token not found, please login first"})
    }

  try{
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    const user= await userModel.findById({_id:decoded.id})
    req.user=user; //req.user req ke andar a new property create karenge means db user ka data hum set karenge req.user ke andar
    next(); //after authorized access req forwarded to chatcontroller
 
    }catch(err){
      console.error("JWT Error:", err.message);
      return res.status(401).json({ message: "Unauthorized-Invalid token, please login again" });
    }
}
module.exports={authenticateUser};