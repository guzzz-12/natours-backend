const mongoose = require("mongoose");
const dotenv = require("dotenv");
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

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tour must have a name"],
    unique: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  price: {
    type: Number,
    required: [true, "Tour must have a price"]
  }
});

const Tour = mongoose.model("Tour", toursSchema);

const testTour = new Tour({
  name: "The Park camper",
  price: 997
});

testTour.save()
.then((document) => {
  console.log(document)
})
.catch((err) => {
  console.log(err)
});

// //Conectar mongoose con la base de datos local
// mongoose.connect(process.env.DATABASE_LOCAL, {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useFindAndModify: false
// })
// .then((connection) => {
//   console.log("Local DB connection successful")
// })

// Listener
app.listen(port, () => {
  console.log(`App running on port ${port}`)
});