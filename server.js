const mongoose = require("mongoose");
const dotenv = require("dotenv");

//Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("Uncaught exception. Shutting down the application...")
  console.log(err.message)
  process.exit(1)
})

dotenv.config({path: "./config.env"});

const app = require("./app");

const port = process.env.PORT || 3000;

const db = process.env.DATABASE.replace("<password>", process.env.DATABASE_PASSWORD)

//Conectar mongoose con la base de datos remota
mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})
.then((connection) => {
  console.log("Remote DB connection successful")
});

// Listener
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`)
});

//Unhandled rejections
process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection. Shutting down the application...")
  console.log(err.message)
  server.close(() => {
    process.exit(1)
  })
});

//Cerrar la aplicación de manera que se procesen los requests pendientes cuando Heroku reinicia el dyno (Evento SIGTERM)
process.on("SIGTERM", () => {
  console.log("Sigterm received: Shutting down the application");
  server.close(() => {
    console.log("Process terminated")
  })
})