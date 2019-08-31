const errorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack
  });
}

const errorProd = (error, res) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong"
    })
  }
}

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    errorDev(error, res)
  } else if (process.env.NODE_ENV === "production") {
    errorProd(error, res)
  }
}