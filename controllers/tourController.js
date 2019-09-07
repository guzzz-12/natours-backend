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