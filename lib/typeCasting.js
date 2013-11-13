var baseTypes = {
  'int': Number,
  'url': String,
  'email': String,
  'string': String,
  'boolean': Boolean
};

module.exports = function (value, schema, db) {
  if (!schema) return value;

  if (value == null) {
    return value;
  }

  var type = schema.type;
  var t = baseTypes[type];
  if (t) {
    return t(value); 
  }
  
  if (type === 'date') {
    if (value instanceof Date) {
      return value;
    }
    return new Date(value);
  }

  var Model = db.model(type);
  if (Model) {
    if (value instanceof Model) {
      return value;
    }
    return new Model(value); 
  }

  return value;
};
