"use strict";

// Catch Async
module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};
