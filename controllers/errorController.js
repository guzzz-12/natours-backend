const errorDev = (error, req, res) => {
  if(req.originalUrl.startsWith("/api")) {
    return res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack
    });
  }

  return res.status(error.statusCode).render("error", {
    title: "Something went wrong",
    message: error.message
  })
  
}

const errorProd = (error, req, res) => {
  if(req.originalUrl.startsWith("/api")) {
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message
      });
    }
    
    return res.status(500).json({
      status: "error",
      message: "Something went wrong"
    })
  }
  
  return res.status(error.statusCode).render("error", {
    title: "Something went wrong",
    message: "Please, try again later"
  })
}

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    errorDev(error, req, res)
  } else if (process.env.NODE_ENV === "production") {
    errorProd(error, req, res)
  }
}