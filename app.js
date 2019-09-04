const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const ErrorHandler = require("./utils/errorHandler");
const errorController = require("./controllers/errorController");
const rateLimit = require("express-rate-limit");

//Inicializar la API
const app = express();

//Middlewares globales:

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

//Middleware para leer archivos estáticos
app.use(express.static(`${__dirname}/public`));

// //Tomar la data de los tours
// app.get("/api/v1/tours", getTours);

// //Tomar un tour según el parámetro id de la URL
// app.get("/api/v1/tours/:id", getSingleTour);

// //Crear un nuevo tour
// app.post("/api/v1/tours", createTour);

// //Editar la data de un tour según la ID especificada en la URL
// app.patch("/api/v1/tours/:id", editTour);

// //Borrar un tour
// app.delete("/api/v1/tours/:id", deleteTour);


//Middleware de las Rutas
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`Can't find ${req.originalUrl} on this server`, 404));
})

app.use(errorController);

module.exports = app;
