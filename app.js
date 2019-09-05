const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const ErrorHandler = require("./utils/errorHandler");
const errorController = require("./controllers/errorController");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

//Inicializar la API
const app = express();

// ------- Middlewares globales -------- //

//Middleware para crear headers HTTP seguros
app.use(helmet());

//Middleware para loguear en consola en ambiente de desarrollo
if(process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Middleware para limitar la cantidad de peticiones por hora para evitar ataques DOS
const limiter = rateLimit({
  max: 100,
  windowMs: 60*60*1000,
  message: "Too many request from this IP, please try again later"
});
app.use("/api", limiter);

//Middlewarepara parsear la data del body
app.use(express.json());

//Limpieza de data contra ataques NoSQL Query Injection
app.use(mongoSanitize());

//Limpieza de data contra ataques XSS
app.use(xss());

//Middleware para leer archivos estáticos
app.use(express.static(`${__dirname}/public`));

//Middleware de las Rutas
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`Can't find ${req.originalUrl} on this server`, 404));
})

app.use(errorController);

module.exports = app;
