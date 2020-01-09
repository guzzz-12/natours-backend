class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = {...this.queryString};
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => {
      delete queryObj[el];
    });

    //El req.query en /api/v1/tours?duration[gte]=5 se traduce a {duration: {gte: 5}}
    //Por lo tanto, es necesario reemplazar {gte: 5} por {$gte: 5} en el query para que funcione como filtro

    // Solución 1:
    // 1. Convertir el req.query en un string
    let queryStr = JSON.stringify(queryObj);

    // 2. Convertir en el string los operadores gte, gt, lte y lt en operadores de mongoDB (${gte}, ${gt}, etc...)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // 3. Ejecutar el query con el filtro que resulta al parsear el string del paso 2:
    this.query = this.query.find(JSON.parse(queryStr));
    
    return this;
  }

  sort() {
    if(this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt")
    }
    return this;
  }

  limitFields() {
    if(this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select("-__v")
    };
    return this;
  }

  paginate(documentsCount) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
      //page=2&limit=10 ---> page 1: 1-11, page 2: 11-20, ...
    this.query = this.query.skip(skip).limit(limit);

    // Chequear si el número de documentos a saltar es mayor a la cantidad de documentos en la colección
    if(skip >= documentsCount) {
      throw new Error("No more documents to display")
    }

    return this;
  }
}

module.exports = APIFeatures;