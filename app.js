const express = require("express");
const fs = require("fs");
const port = 3000;

//Inicializar la API
const app = express();

//Middleware
app.use(express.json());

//Data de los tours
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

//Tomar la data de los tours
app.get("/api/v1/tours", (req, res) => {
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours: tours
    }
  })
});

//Tomar un tour según el parámetro id de la URL
app.get("/api/v1/tours/:id", (req, res) => {
  const id = req.params.id * 1;
  
  const getTour = tours.find(tour => {
    return tour[id] === req.params.id * 1
  });

  if (!getTour) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID"
    })
  };

  res.status(200).json({
    status: "success",
    data: {
      tour: getTour
    }
  });
});

//Crear un nuevo tour
app.post("/api/v1/tours", (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({id: newId}, req.body);

  tours.push(newTour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour
      }
    })
  });
});


// Listener
app.listen(port, () => {
  console.log(`App running on port ${port}`)
});

