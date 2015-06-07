'use strict';

const Forecast = require('forecast.io');

const { FORECAST_API_KEY } = process.env;

if (!FORECAST_API_KEY) {
  throw new Error("FORECAST_API_KEY was not set in this environment.");
}

let forecast = new Forecast({
  APIKey: FORECAST_API_KEY
});

let router = require('express').Router();

router.get('/forecast', (req, res, next) => {
  let { lat, long } = req.query;

  if (!lat || !long) {
    console.log('There was no lat or long');
    let err = new Error('Missing either latitude or longitude.');
    err.status = 400;
    return next(err);
  }

  forecast.get(lat, long, (err, response, data) => {
    if (err) {
      err.status = err.status || 500;
      console.log(err);
      console.log('There was a forecast.io error');
      return next(err);
    }

    console.log('Response:', response);
    console.log('Data:', data);
    res.json(data);
  });
});

router.get('/', (req, res) => {
  res.json({ success: true, message: 'You made it!' });
});

module.exports = router;

