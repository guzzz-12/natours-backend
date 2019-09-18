const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path: "./config.env"});
const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");

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

//Leer el archivo json
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"));

//Importar la data en la base de datos
const importData = async () => {
  try{
    await Tour.create(tours);
    // await User.create(users, {validateBeforeSave: false});
    // await Review.create(reviews);
    console.log("Data successfully loaded");
  } catch (error) {
    console.log(error)
  }
  process.exit();
};

//Borrar toda la data de la colección
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    // await User.deleteMany();
    // await Review.deleteMany();
    console.log("Data successfully deleted");
  } catch (error) {
    console.log(error)
  }
  process.exit();
};

if(process.argv[2] === "--import") {
  importData();
} else if(process.argv[2] === "--delete") {
  deleteData()
};

console.log(process.argv)