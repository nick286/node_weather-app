const yargs = require('yargs');
const axios = require('axios');

const argv = yargs
  .options({
    a: {
      demand: true,
      alias: 'address',
      describe: 'Address to fetch weather for',
      string: true
    }
  })
  .help()
  .alias('help', 'h')
  .argv;

var encodedAddress = encodeURIComponent(argv.address);
var geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`;

axios.get(geocodeUrl).then((response) => {
  if (response.data.status === 'ZERO_RESULTS') {
    throw new Error('Unable to find that address.');
  }

  var lat = response.data.results[0].geometry.location.lat;
  var lng = response.data.results[0].geometry.location.lng;
  var weatherUrl = `https://api.forecast.io/forecast/4a04d1c42fd9d32c97a2c291a32d5e2d/${lat},${lng}`;
  console.log(response.data.results[0].formatted_address);
  return axios.get(weatherUrl);
}).then((response) => {
  var temperature = ((response.data.currently.temperature - 32) / 1.8).toFixed(2);
  var apparentTemperature = ((response.data.currently.apparentTemperature - 32) / 1.8).toFixed(2);
  var currentlyPrecipType = response.data.currently.precipType;
  var currentlyPrecipProbabilty = response.data.currently.precipProbability * 100;
  var hourlyPrecipType = response.data.hourly.data[2].precipType;
  var hourlyPrecipProbabilty = response.data.hourly.data[2].precipProbability * 100;

  if (currentlyPrecipType === undefined) {
    console.log(
  `It's currently ${temperature}.
It feels like ${apparentTemperature}.
In 2 hours, the probability of ${hourlyPrecipType} are at ${hourlyPrecipProbabilty}%.`);
  } else {
    console.log(
  `It's currently ${temperature} with a probability of ${currentlyPrecipType} of ${currentlyPrecipProbabilty}%.
It feels like ${apparentTemperature}.
In 2 hours, the probability of ${hourlyPrecipType} are at ${hourlyPrecipProbabilty}%.`);
  }

}).catch((e) => {
  if (e.code === 'ENOTFOUND') {
    console.log('Unable to connect to API servers.');
  } else {
    console.log(e.message);
  }
});
