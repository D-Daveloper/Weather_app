import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { config } from 'dotenv';


config()
const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.APIKEY
const API_URL = process.env.API_URL
const API_FORECAST = process.env.API_FORECAST

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", 
    "Thursday", "Friday", "Saturday"
];
const today = new Date();
// console.log(today)
const dayOfWeek = days[today.getDay()];
const dayOfMonth = today.getDate();
const month = months[today.getMonth()];
const localTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formattedDate = `${dayOfWeek}, ${dayOfMonth} ${month}`;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

function getTime(time){
    const timestamp = time;
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    let formattedTime = date.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
    return formattedTime
}

function ConvertMeter(meter){
    return Math.round(meter * 3.6)
}
let fun = [
    {
      dt: 1713960000,
      main: {
        temp: 33.17,
        feels_like: 36.93,
        temp_min: 33.17,
        temp_max: 36.04,
        pressure: 1010,
        sea_level: 1010,
        grnd_level: 986,
        humidity: 51,
        temp_kf: -2.87
      },
      weather: [ [Object] ],
      clouds: { all: 70 },
      wind: { speed: 3.47, deg: 208, gust: 1.83 },
      visibility: 10000,
      pop: 0,
      sys: { pod: 'd' },
      dt_txt: '2024-04-24 12:00:00'
    },
    {
      dt: 1713970800,
      main: {
        temp: 35.22,
        feels_like: 38.95,
        temp_min: 35.22,
        temp_max: 36.96,
        pressure: 1007,
        sea_level: 1007,
        grnd_level: 983,
        humidity: 44,
        temp_kf: -1.74
      },
      weather: [ [Object] ],
      clouds: { all: 62 },
      wind: { speed: 3.25, deg: 217, gust: 2.06 },
      visibility: 10000,
      pop: 0,
      sys: { pod: 'd' },
      dt_txt: '2024-04-24 15:00:00'
    },
    {
      dt: 1713981600,
      main: {
        temp: 29.92,
        feels_like: 33.5,
        temp_min: 29.92,
        temp_max: 29.92,
        pressure: 1006,
        sea_level: 1006,
        grnd_level: 984,
        humidity: 64,
        temp_kf: 0
      },
      weather: [ [Object] ],
      clouds: { all: 78 },
      wind: { speed: 4.68, deg: 193, gust: 9.58 },
      visibility: 10000,
      pop: 0.31,
      rain: { '3h': 0.84 },
      sys: { pod: 'n' },
      dt_txt: '2024-04-24 18:00:00'
    },
    {
      dt: 1713992400,
      main: {
        temp: 27.76,
        feels_like: 30.71,
        temp_min: 27.76,
        temp_max: 27.76,
        pressure: 1009,
        sea_level: 1009,
        grnd_level: 987,
        humidity: 74,
        temp_kf: 0
      },
      weather: [ [Object] ],
      clouds: { all: 98 },
      wind: { speed: 3.91, deg: 203, gust: 10.16 },
      visibility: 10000,
      pop: 0.41,
      sys: { pod: 'n' },
      dt_txt: '2024-04-24 21:00:00'
    },
    {
      dt: 1714003200,
      main: {
        temp: 25.37,
        feels_like: 26.34,
        temp_min: 25.37,
        temp_max: 25.37,
        pressure: 1010,
        sea_level: 1010,
        grnd_level: 987,
        humidity: 91,
        temp_kf: 0
      },
      weather: [ [Object] ],
      clouds: { all: 95 },
      wind: { speed: 3.14, deg: 243, gust: 10.38 },
      visibility: 10000,
      pop: 0.61,
      rain: { '3h': 4.63 },
      sys: { pod: 'n' },
      dt_txt: '2024-04-25 00:00:00'
    },
    {
      dt: 1714014000,
      main: {
        temp: 25.36,
        feels_like: 26.3,
        temp_min: 25.36,
        temp_max: 25.36,
        pressure: 1009,
        sea_level: 1009,
        grnd_level: 986,
        humidity: 90,
        temp_kf: 0
      },
      weather: [ [Object] ],
      clouds: { all: 100 },
      wind: { speed: 2.67, deg: 231, gust: 9.82 },
      visibility: 10000,
      pop: 0,
      sys: { pod: 'n' },
      dt_txt: '2024-04-25 03:00:00'
    }
]
function gethourlyattributes(array){
    const time = []
    const temp  = []
    const meter = []
    for( let i = 0; i <= 4; i++){
        const hourly_forecast = array[i]
        let dateTimeParts = hourly_forecast.dt_txt.split(" ");
        let timeWithoutDate = dateTimeParts[1].split(":").slice(0, 2).join(":");
        let temperature = Math.round(hourly_forecast.main.temp)
        let windSpeed = Math.round(hourly_forecast.wind.speed * 3.6)


        temp.push(temperature)
        time.push(timeWithoutDate)
        meter.push(windSpeed)
    }
    return [time,temp,meter]
}


// const timestamp = 1713893841;
// const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
// const formattedTime = date.toLocaleString([], { hour: '2-digit', minute: '2-digit' }); // Convert to local time string
// console.log("Formatted Time:", formattedTime);


app.get("/", async (req, res) => {
    try {
      const result = await axios.get(API_URL, {
        params: {
            lat: "6.460618593643324",
            lon: "7.500271441294773",
            units: "Metric",
            apiKey: apiKey,
        },
      });
      const forecast = await axios.get(API_FORECAST,{
        params: {
            lat: "6.460618593643324",
            lon: "7.500271441294773",
            units: "Metric",
            apiKey: apiKey,
        },
      })
        const hourly_forecast = forecast.data.list
        const [hour,temp, meter] = gethourlyattributes(hourly_forecast)
        const data = {
        time:localTime,
        date: formattedDate,
        sunrise_time: getTime(result.data.sys.sunrise),
        sunset_time: getTime(result.data.sys.sunset),
        wind_speed: ConvertMeter(result.data.wind.speed),
        hour: hour,
        hourTemp : temp,
        windSpeed: meter
    }
      res.render("index", { content:result.data, time:data});
    } catch (error) {
      res.status(404).send(error.message);
    }
  });

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
