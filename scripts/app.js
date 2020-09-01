window.addEventListener('load', () => {
    let long;
    let lat;

    let temperatureIndicator = document.querySelector('.temperature');
    let locationTimezone = document.querySelector('.location-timezone');
    let unitOfMeasurement = document.querySelector('.weather-header span');
    let humidityPercentage = document.querySelector('.humidity-percentage');
    let sunsetTime = document.querySelector('.sunset-hour');
    let sunriseTime = document.querySelector('.sunrise-hour');
    let temperatureMaxForecast = document.querySelectorAll('.temp-max');
    let temperatureMinForecast = document.querySelectorAll('.temp-min');
    let dayForecast = document.querySelectorAll(".daily-forecast h3");
    let forecastIcon = document.querySelectorAll(".daily-forecast i");
    let currentWeatherIcon = document.querySelector(".weather-header i");
    let weatherHeader = document.querySelector(".weather-header");
    let weatherCard = document.querySelector(".weather-card");
    let errorMessage = document.querySelector(".error");


    let weatherValues = {
        "Thunderstorm": 0,
        "Drizzle": 1,
        "Rain": 2,
        "Snow": 3,
        "Mist": 4,
        "Smoke": 4,
        "Haze": 4,
        "Dust": 4,
        "Fog": 4,
        "Sand": 4,
        "Dust": 4,
        "Ash": 4,
        "Squall": 4,
        "Tornado": 4,
        "Clear": 5,
        "Clouds": 6
    };

    let colorPalette = [
        ["#3a6a92", "#5f94bf"],
        ["#825b86", "#a986ac"],
        ["#797bb9", "#afb0d5"],
        ["#58c1ee", "#a2ddf6"],
        ["#246a73", "#3babba"],
        ["#7cc6fe", "#c2e4fe"],
        ["#0596c7", "#24c4f9"],
        ["#2c2a4a", "#4e4983"]];


    var d = new Date();
    var weekday = ['Sunday', 'Monday', 'Tuesday', "Wednesday", "Thursday", "Friday", "Saturday"];
    var today = weekday[d.getDay()];
    console.log(navigator.geolocation);

    navigator.geolocation.getCurrentPosition(position => {
        console.log(position);
        long = position.coords.longitude;
        lat = position.coords.latitude;

        const proxy = 'https://cors-anywhere.herokuapp.com/';
        const api = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=hourly,minutely&appid=${YOUR_API_KEY}`;
        const reverseGeocoding = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}&zoom=18&addressdetails=1`;

        fetch(reverseGeocoding)
            .then(response => {
                return response.json();
            })
            .then(data => {
                console.log(data);
                const { city, municipality } = data.address;
                locationTimezone.textContent = (city === undefined ? municipality : city);

            });

        fetch(api)
            .then(response => {
                return response.json();
            })
            .then(data => {
                console.log(data);
                const { main } = data.current.weather[0];
                const { humidity, sunset, sunrise, temp } = data.current;


                //Set DOM Elements from the API

                //Current Weather
                if (main == "Clear" && Date.now() / 1000 > parseInt(sunset, 10)) {
                    currentWeatherIcon.className = "wi wi-night-clear";
                } else {
                    currentWeatherIcon.className = "wi " + associateIcon(main);
                }

                let gradient = (Date.now() / 1000 > parseInt(sunset, 10)) ? colorPalette[7] : colorPalette[weatherValues[main]];

                weatherHeader.style["background"] = "linear-gradient(" + gradient[1] + "," + gradient[0] + ")";

                let temperature = kelvinToCelsius(temp);
                temperatureIndicator.textContent = temperature + "°";


                //Weather Info
                sunriseDate = new Date(sunrise * 1000);
                sunriseTime.textContent = time_with_leading_zeros(sunriseDate);

                sunsetDate = new Date(sunset * 1000);
                sunsetTime.textContent = time_with_leading_zeros(sunsetDate);
                humidityPercentage.textContent = humidity + "%";

                //Daily Forecast
                for (var i = 0; i < temperatureMaxForecast.length; i++) {
                    dayForecast[i].textContent = weekday[(weekday.indexOf(today) + i + 1) % 7].substring(0, 3).toUpperCase();
                    forecastIcon[i].className = "wi " + associateIcon(data.daily[i + 1].weather[0].main);
                    temperatureMaxForecast[i].textContent = kelvinToCelsius(data.daily[i + 1].temp.max) + '°';
                    temperatureMinForecast[i].textContent = kelvinToCelsius(data.daily[i + 1].temp.min) + '°';
                }



                //Change temperature to Celsius/Farheneit
                unitOfMeasurement.addEventListener('click', () => {
                    if (unitOfMeasurement.textContent === "°F") {
                        unitOfMeasurement.textContent = "°C";
                        temperatureIndicator.textContent = temperature + "°";
                        for (var i = 0; i < temperatureMaxForecast.length; i++) {
                            temperatureMaxForecast[i].textContent = kelvinToCelsius(data.daily[i + 1].temp.max) + '°';
                            temperatureMinForecast[i].textContent = kelvinToCelsius(data.daily[i + 1].temp.min) + '°';
                        }
                    } else {
                        unitOfMeasurement.textContent = "°F";
                        temperatureIndicator.textContent = celsiusToFarheneit(temperature) + "°";
                        for (var i = 0; i < temperatureMaxForecast.length; i++) {
                            temperatureMaxForecast[i].textContent = kelvinToFarheneit(data.daily[i + 1].temp.max) + '°';
                            temperatureMinForecast[i].textContent = kelvinToFarheneit(data.daily[i + 1].temp.min) + '°';
                        }
                    }
                });
            });
    },
        function (error) {
            if (error.code == error.PERMISSION_DENIED)
                weatherCard.style["visibility"] = "hidden";
            errorMessage.style["visibility"] = "visible";
        });






    function kelvinToCelsius(temp) {
        return (temp - 273.15).toFixed(0);
    }

    function celsiusToFarheneit(temp) {
        return (temp * 9 / 5) + 32;
    }

    function farheneitToCelsius(temp) {
        retunr(temp - 32) * 5 / 9;
    }

    function kelvinToFarheneit(temp) {
        return ((temp - 273.15) * 9 / 5 + 32).toFixed(0);
    }

    function time_with_leading_zeros(dt) {
        return (dt.getHours() < 10 ? '0' : '') + dt.getHours() + "h" + (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes();
    }

    function associateIcon(weather) {
        switch (weather) {
            case "Drizzle":
                return "wi-rain-mix";
                break;
            case "Mist":
                return "wi-fog";
                break;
            case "Haze":
                return "wi-day-haze";
                break;
            case "Sand":
                return "wi-sandstorm";
                break;
            case "Ash":
                return "wi-volcano";
                break;
            case "Squall":
                return "wi wi-windy";
            case "Clouds":
                return "wi-cloud";
                break;
            case "Clear":
                return "wi-day-sunny";
                break;
            default:
                return "wi-" + weather.toLowerCase();
        }
    }
})