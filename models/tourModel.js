const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
// const User = require("./userModel");

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tour must have a name"],
    unique: true,
    trim: true,
    maxlength: [40, "Tour name must be no more than 40 characters long"],
    minlength: [10, "Tour name must be at least 10 characters long"],
    // validate: [validator.isAlpha, "Tour name can only contain letters"]
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, "A tour must have a duration"]
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have a group size"]
  },
  difficulty: {
    type: String,
    required: [true, "A tour must have a difficulty"],
    enum: {
      values: ["easy", "medium", "difficult"],
      message: "Difficulty must be either: easy, medium or difficult"
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
    set: val => Math.round(val*10)/10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, "Tour must have a price"]
  },
  priceDiscount: {
    type: Number,
    validate: {
      //La validación sólo se ejecuta al crear un nuevo documento, no al actualizar un documento existente
      validator: function(val) {
        return val < this.price
      },
      message: "Discount price {{VALUE}} must be lower than regular price"
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, "A tour must have a description"]
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, "A tour must have a cover image"]
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  },
  startLocation: {
    //GeoJSON
    type: {
      type: String,
      default: "Point",
      enum: ["Point"]
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User"
    }
  ]
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
});

//Índices
toursSchema.index({price: 1, ratingsAverage: -1});
toursSchema.index({slug: 1});
toursSchema.index({startLocation: "2dsphere"});

//Propiedad virtual para mostrar la duración del tour en semanas
toursSchema.virtual("durationWeeks").get(function() {
  return `${(this.duration/7).toFixed(2)} weeks`
});

//Tomar los reviews correspondientes a un tour desde el reviewModel y almacenarlos en la propiedad virtual "reviews" en los tours
toursSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id"
})

//Document Middleware: se ejecuta antes de .save() y .create()
toursSchema.pre("save", function(next) {
  this.slug = slugify(this.name, {lower: true});
  next();
});

//Query Middleware
//Retornar sólo los tours que no sean secretos
toursSchema.pre(/^find/, function(next) {
  this.find({secretTour: {$ne: true}})
  this.start = Date.now()
  next()
})

//Loguear el tiempo que tomó en realizarse el query
toursSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`)
  next()
})

//Llenar el campo guides con la información de los guías de los tours referenciándolos mediante su ID
toursSchema.pre(/^find/, function(next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt"
  });
  next()
})


//Aggregation Middleware
toursSchema.pre("aggregate", function(next) {
  //Agregar otro stage al inicio del aggregation pipeline
  this.pipeline().unshift({$match: {secretTour: {$ne: true}}})
  console.log(this.pipeline())
  next()
})

const Tour = mongoose.model("Tour", toursSchema);

module.exports = Tour;