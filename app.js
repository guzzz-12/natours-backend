const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

//Inicializar la API
const app = express();

//Middleware
if(process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());

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

module.exports = app;
