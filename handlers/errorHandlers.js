// catches errors if any by any async function
exports.catchErrors = (fn) => {
  return function(req, res, next) {
    return fn(req, res, next).catch(next)
  }
}

/*
MongoDB Validation Error Handler

Detect if there are any mongodb validation errors that can be nicely show via flash message
*/

exports.validationErrors = (err, req, res, next) => {
  if (!err.errors) {
    return next(err)
  }  
  console.log(err)
  res.status(400).send(err)
}

/* 
if a not found route is hit, mark it as 404 and pass it along to the next error handler to display
*/
exports.notFound = (req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
}

exports.developmentErrors = (err, req, res, next) => {
  err.stack = err.stack || ''
  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>')
  }
  res.status(err.status || 500)
  res.format({
    // Based on the `Accept` http header
    'text/html': () => {
      res.send(errorDetails)
    }, // Form Submit, Reload the page
    'application/json': () => res.json(errorDetails) // Ajax call, send JSON back
  })
}

/*
Production Error Handler

No stacktraces are leaked to user
*/
exports.productionErrors = (err, req, res, next) => {
  res.status(err.status || 500)
  res.send(err.message)
}