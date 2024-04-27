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
const GEO_URL = process.env.GEO_URL

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(bodyParser.json());

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", 
    "Thursday", "Friday", "Saturday"
];

const today = new Date();
const dayOfWeek = days[today.getDay()];
const dayOfMonth = today.getDate();
const month = months[today.getMonth()];
const localTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formattedDate = `${dayOfWeek}, ${dayOfMonth} ${month}`;

function getTime(time){
    const timestamp = time;
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    let formattedTime = date.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
    return formattedTime
}

function ConvertMeter(meter){
    return Math.round(meter * 3.6)
}

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
app.post("/city", async (req,res) => {
  const location = req.body.location;
  try {
    const geo_location = await axios.get(GEO_URL, {
      params: {
          q:location,
          apiKey: apiKey
      },
    })
    const result = await axios.get(API_URL, {
      params: {
          lat: geo_location.data[0].lat,
          lon: geo_location.data[0].lon,
          units: "Metric",
          apiKey: apiKey,
    },
  })
    const forecast = await axios.get(API_FORECAST,{
      params: {
          lat: geo_location.data[0].lat,
          lon: geo_location.data[0].lon,
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
})

app.post('/api/location', async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    const result = await axios.get(API_URL, {
      params: {
          lat: latitude,
          lon: longitude,
          units: "Metric",
          apiKey: apiKey,
      },
    });
    const forecast = await axios.get(API_FORECAST,{
      params: {
          lat: latitude,
          lon: longitude,
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
