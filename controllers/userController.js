const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");

//Operaciones con usuarios
exports.getAllUsers = async (req, res, next) => {
  try {    
    const users = await User.find();

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users: users
      }
    })
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
};