const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const ErrorHandler = require("../utils/errorHandler");
const factory = require("./handlerFactory");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = async (req, res, next) => {
  try {
    //Obtener el tour
    const tour = await Tour.findById(req.params.tourId);

    if(!tour) {
      return next(new ErrorHandler("Tour not found", 404));
    }
  
    //Crear la sesión de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${req.protocol}://${req.get("host")}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          name: `${tour.name} Tour`,
          description: tour.summary,
          images: [`https://natours-traveling.herokuapp.com/img/tours/${tour.imageCover}`],
          amount: tour.price * 100,
          currency: "usd",
          quantity: 1
        }
      ]
    })
  
    //Enviar la sesión al cliente
    res.status(200).json({
      status: "success",
      session: session
    });

  } catch(error) {
    return next(new ErrorHandler(error, 400))
  }
}

//Solución temporal (insegura) para crear los bookings
exports.createBookingCheckout = async (req, res, next) => {
  try {
    const {tour, user, price} = req.query;
  
    if (!tour && !user && !price) {
      return next()
    }
  
    await Booking.create({tour, user, price});

    // res.redirect(`${req.protocol}://${req.get("host")}/`);
    res.redirect(`${req.protocol}://${req.get("host")}/my-tours`);

  } catch(error) {
    return next(new ErrorHandler(error, 400))
  }
}

//Operaciones CRUD de los bookings
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);