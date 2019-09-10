const Tour = require("../models/tourModel");

//Mostrar todos los tours en el homepage
exports.getOverview = async (req, res) => {
  try {
    //Tomar toda la data de los tours desde la API
    const tours = await Tour.find();
  
    //Renderizar el template usando la data de los tours
    res.status(200).render("overview", {
      title: "All tours",
      tours: tours
    })

  } catch(error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
}

//Mostrar los detalles de cada tour
exports.getTour = (req, res) => {
  res.status(200).render("tour", {
    title: "The Forest Hiker Tour"
  })
}