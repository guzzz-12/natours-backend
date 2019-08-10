const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");

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
exports.getSingleTour = async (req, res) => {
  try {
    // const tour = await Tour.findOne({_id: req.params.id});
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        tour: tour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
};

//Crear tour
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
  
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour
      }
    })
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error
    })
  }
};

//Editar tour
exports.editTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: "success",
      data: {
        tour: tour
      }
    })
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
};

//Borrar tour
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id)

    res.status(204).json({
      status: "success",
      data: {
        tour: null
      }
    })
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
};

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
}