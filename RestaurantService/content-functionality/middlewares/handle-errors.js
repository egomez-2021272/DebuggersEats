export const errorHandler = (err, req, res, next) => { // Añadido 'next'

  console.error(`DebbugersEat Error: ${err.message}`);
  

  if (process.env.NODE_ENV !== 'production') {
    console.error(`Stack trace: ${err.stack}`);
  }
  
  console.error(`Request: ${req.method} ${req.path}`);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Error de validación en los datos del restaurante',
      errors,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `El valor para el campo [${field}] ya existe en este restaurante`,
      error: 'DUPLICATE_FIELD',
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'El formato del ID proporcionado no es válido',
      error: 'INVALID_ID',
    });
  }


  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.code || 'RESTAURANT_ERROR',
    });
  }


  res.status(500).json({
    success: false,
    message: 'Ha ocurrido un error inesperado en el servidor',
    error: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack,
    }),
  });
};