const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const port = 3000;

//Inicializar la API
const app = express();

//Middleware
app.use(morgan("dev"));
app.use(express.json());

//Data de los tours
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));


//Tomar la data de los tours
const getTours = (req, res) => {
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours: tours
    }
  })
};


//Tomar un tour según el parámetro id de la URL
const getSingleTour = (req, res) => {
  const id = req.params.id * 1;
  
  const getTour = tours.find(tour => {
    return tour.id === id
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
};


//Crear un nuevo tour
const createTour = (req, res) => {
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
};


//Editar la data de un tour según la ID especificada en la URL
const editTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID"
    })
  };

  res.status(200).json({
    status: "success",
    data: {
      tour: "Updated Tour"
    }
  })
};


//Borrar un tour
const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID"
    })
  };

  res.status(204).json({
    status: "success",
    data: {
      tour: null
    }
  })
};


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

app.route("/api/v1/tours")
.get(getTours)
.post(createTour);

app.route("/api/v1/tours/:id")
.get(getSingleTour)
.patch(editTour)
.delete(deleteTour)

// Listener
app.listen(port, () => {
  console.log(`App running on port ${port}`)
});

