const Tour = require("../models/tourModel");
const ErrorHandler = require("../utils/errorHandler");

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
exports.getTour = async (req, res, next) => {
  try {
    const tour = await Tour.findOne({slug: req.params.tourSlug}).populate({
      path: "reviews",
      fields: "review rating author"
    });

    if (!tour) {
      return next(new ErrorHandler("There's no tour with that name", 404))
    }
    
    res.status(200).render("tour", {
      title: tour.name,
      tour: tour
    });

  } catch(error) {
    if(process.env.NODE_ENV === "production") {
      return next(new ErrorHandler("Tour not found", 404))
    }
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
}

//Mostrar formulario de login
exports.login = async (req, res) => {
  try {
    res.status(200).render("login", {
      title: "Login"
    });

  } catch(error) {
    res.status(400).json({
      status: "fail",
      message: error
    })
  }
}

//Renderizar la página del usuario logueado
exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account"
  });
}