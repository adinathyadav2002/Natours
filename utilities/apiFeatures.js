class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    let queryObj = { ...this.queryStr };
    // 1) REMOVING EXTRA ENDPOINTS
    const excludedFields = ['page', 'fields', 'sort', 'limit'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // replace query string form gte to $gte for mongodb
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`,
    );
    queryObj = JSON.parse(queryString);

    // Here, query is just a plain JavaScript object, often called a
    // query filter, describing the conditions for retrieving documents.
    this.query = this.query.find(queryObj);

    // After this line, query becomes a Mongoose Query object.

    // Mongoose Query object: This is an object that allows you
    // to build a database query with methods like
    // .sort(), .select(), .limit(), etc., to customize the result.
    return this;
  }

  sort() {
    // 2) SORTING FUNCTIONALITY
    if (this.queryStr.sort) {
      const sortby = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortby);
    } else {
      this.query = this.query.sort('-createdBy');
    }
    return this;
  }

  paginate() {
    // 4) PAGINATION
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  limitFields() {
    // 3) PROPERTIES SELECTION
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
}

module.exports = APIFeatures;
