const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/errorHandler");
const factory = require("./handlerFactory");

//Función para mostrar errores de validación
const validationErrors = (err) => {
  const errorProperties = Object.values(err.errors)
  let allErrors = errorProperties.map((error) => {
    return `${error.message}.`
  })
  const message = `Invalid data: ${allErrors.join(" ")}`
  return new ErrorHandler(message, 400).message
}

//Función para mostrar errores de data duplicada
const duplicateDataErrors = (err) => {
  const value = err.errmsg.split(":")
  const message = `Duplicate field: ${value[value.length - 1].replace(" \"", "").replace("\" }", "")}. Please try another name.`;
  return new ErrorHandler(message, 400).message
}

//Función para mostrar errores de ID no válida
const castErrors = (err) => {
  const newMessage = `Invalid ${err.path}: ${err.value}`
  return new ErrorHandler(newMessage, 404).message
}


//------ Operaciones CRUD ------//
//Tomar todos los tours
exports.getTours = async (req, res) => {
  try {
    //Ejecutar el query
    const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

    const tours = await features.query;

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours: tours
      }
    })
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
};

//Tomar un tour por su ID
exports.getSingleTour = async (req, res, next) => {
  try {
    // const tour = await Tour.findOne({_id: req.params.id});
    const tour = await Tour.findById(req.params.id).populate("reviews");

    if(!tour) {
      return next(new ErrorHandler("No tour found for that ID", 404))
    }

    res.status(200).json({
      status: "success",
      data: {
        tour: tour
      }
    });
  } catch (error) {
    let err = {...error}
    if (process.env.NODE_ENV === "production") {
      if(error.name === "CastError") {
        err = castErrors(error)
      }
    }
    res.status(404).json({
      status: "fail",
      message: err
    })
  }
};

//Crear tour
exports.createTour = factory.createOne(Tour);

//Editar tour
exports.editTour = factory.updateOne(Tour);

//Borrar tour
exports.deleteTour = factory.deleteOne(Tour);

//Calcular y agrupar las estadísticas de los tours
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {ratingsAverage: {$gte: 4.5}}
      },
      {
        $group: {
          _id: "$difficulty",
          numTours: {$sum: 1},
          avgRating: {$avg: "$ratingsAverage"},
          numRaitings: {$sum: "$ratingsQuantity"},
          avgPrice: {$avg: "$price"},
          minPrice: {$min: "$price"},
          maxPrice: {$max: "$price"},
        }
      },
      {
        $sort: {avgPrice: 1}
      }
    ]);
    res.status(200).json({
      status: "success",
      data: {
        stats: stats
      }
    });
  } catch (error) {
      res.status(404).json({
      status: "fail",
      message: error
    })
  }
};

//Obtener el número de tours por mes de inicio
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates"
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {$month: "$startDates"},
          numToursStarts: {$sum: 1},
          tours: {$push: "$name"}
        }
      },
      {
        $addFields: {month: "$_id"}
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: {numToursStarts: -1}
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: "success",
      data: {
        plan: plan
      }
    })
  } catch (error) {
      res.status(404).json({
      status: "fail",
      message: error
    })
  }
}