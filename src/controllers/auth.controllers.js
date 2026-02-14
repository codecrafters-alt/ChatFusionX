const userModel = require("../models/user.models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
async function registerUser(req, res) {
  const {
    email,
    fullName: { firstName, lastName },
    password,
  } = req.body;
  const userAlreadyExists = await userModel.findOne({
    email: email,
  });
  if (userAlreadyExists) {
    return res.status(409).json({
      message: "user already in use",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.create({
    email,
    fullName: {
      firstName,
      lastName,
    },
    password: hashedPassword,
  });

  //token creation
  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
  );

  //save token in cookie
  res.cookie("token", token);

  return res.status(201).json({
    message: "user registered successfully",
    user: {
      email: user.email,
      fullName: user.fullName,
      id: user._id,
    },
  });
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    return res.status(404).json({
      message: "email not found, please register",
    });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({
      message: "invalid credentials, unauthorized access",
    });
  }
  //token creation
  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
  );

  //save token in cookie
  res.cookie("token", token, {
    //after 7 days it will be expired
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });

  return res.status(200).json({
    message: "user logged_in successfully",
    user: {
      email: user.email,
      fullName: user.fullName,
      id: user._id,
    },
  });
}

module.exports = { registerUser, loginUser };
