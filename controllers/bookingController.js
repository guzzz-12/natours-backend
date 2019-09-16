const Tour = require("../models/tourModel");
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
      success_url: `${req.protocol}://${req.get("host")}/`,
      cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          name: `${tour.name} Tour`,
          description: tour.summary,
          images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
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