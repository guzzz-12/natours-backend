const Tour = require("../models/tourModel");
const ErrorHandler = require("../utils/errorHandler");
const factory = require("./handlerFactory");


//------ Operaciones CRUD ------//
//Leer todos los tours
exports.getTours = factory.getAll(Tour);

//Leer la información de un tour
exports.getSingleTour = factory.getOne(Tour, "reviews");

//Crear tour
exports.createTour = factory.createOne(Tour);

//Editar tour
exports.editTour = factory.updateOne(Tour);

//Borrar tour
exports.deleteTour = factory.deleteOne(Tour);

//Calcular y agrupar las estadísticas de los tours
exports.getTourStats = async (req, res, next) => {
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
    if (process.env.NODE_ENV === "production") {
      return next(new ErrorHandler("Sorry! There was a problem getting the tour stats. Try again later", 400))
    }

    return next(new ErrorHandler(error, 400));
  }
};

//Obtener el número de tours por mes de inicio
exports.getMonthlyPlan = async (req, res, next) => {
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
    if (process.env.NODE_ENV === "production") {
      return next(new ErrorHandler("Sorry! There was a problem getting the monthly plan. Try again later", 400))
    }
    
    return next(new ErrorHandler(error, 400));
  }
}

//Obtener los tours cuya ubicación (startLocation) se encuentre dentro de la distancia determinada en los parámetros de la URL
exports.getToursWithin = async (req, res, next) => {
  try {
    const {distance, latlon, unit} = req.params;
    const [lat, lon] = latlon.split(",");

    //Convertir la distancia a radianes
    const radius = unit === "mi" ? distance/3963.2 : distance/6378.1;
  
    if (!lat || !lon) {
      next(new ErrorHandler("Please provide latitude and longitude in the format lat,lon", 400));
    }
  
    const tours = await Tour.find({
      startLocation: {
        $geoWithin: {$centerSphere: [[lon, lat], radius]}
      }
    });
  
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        data: tours
      }
    });

  } catch(error) {
    if (process.env.NODE_ENV === "production") {
      return next(new ErrorHandler("Sorry! There was a problem getting the tours. Try again later", 400))
    }
    return next(new ErrorHandler(error, 400));
  }
}

//Calcular las distancias de los tours que se encuentren dentro de la distancia especificada
exports.getDistances = async (req, res, next) => {
  try {
    const {latlon, unit} = req.params;
    const [lat, lon] = latlon.split(",");
  
    if (!lat || !lon) {
      next(new ErrorHandler("Please provide latitude and longitude in the format lat,lon", 400));
    }

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lon * 1, lat * 1],
          },
          distanceField: "distance",
          distanceMultiplier: 0.001
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);

    res.status(200).json({
      status: "success",
      data: {
        data: distances
      }
    });

  } catch(error) {
    if (process.env.NODE_ENV === "production") {
      return next(new ErrorHandler("Sorry! There was a problem calculating the distances. Try again later", 400))
    }

    return next(new ErrorHandler(error, 400));
  }
}