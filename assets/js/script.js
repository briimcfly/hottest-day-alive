const APIKey = config.MY_KEY;
const input = document.querySelector(`input`);
const recentBlock = document.querySelector('#recent');
const forecastEl = document.querySelector(`#fiveday`);

//Check local storage for any stored results 
let storedCities = localStorage.getItem("cityNames");

//If data exists, parse it.. else, return an empty array
let cityNames = storedCities ? JSON.parse(storedCities) : [];

//a function for clearing fields
function clear(element){
    element.value="";
}

weatherIcon = "";

//Function for displaying weather condition 
function weatherCondition(condition){

    //remove current icons and reset the initial fa-solid icon

    if (condition == "Clear"){
        weatherIcon = "fa-sun";
    }
    else if (condition == "Clouds"){
        weatherIcon = "fa-clouds";
    }
    else if (condition == "Atmosphere"){
        weatherIcon = "fa-water";
    }
    else if (condition == "Snow"){
        weatherIcon = "fa-snowflakes";
    }
    else if (condition == "Rain"){
        weatherIcon = "fa-raindrops";
    }
    else if (condition == "Drizzle"){
        weatherIcon = "fa-cloud-drizzle";
    }
    else if (condition == "Thunderstorm"){
        weatherIcon = "fa-cloud-bolt";
    }
}

//Fetch Current Weather Function 
function getCurrentData(cityName){
        //Query URL
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey + "&units=imperial";
        fetch (queryURL)
        .then(function (response){
            return response.json();
        })
        .then(function (data){

            // Variables for Current Weather
            var currentCity = data.name;
            var currentTemp = Math.round(data.main.temp);
            var currentIcon = data.weather[0].main;
            var currentWind = Math.round(data.wind.speed);
            var currentHumidity = Math.round(data.main.humidity);
            var currentDate = dayjs.unix(data.dt).format(`dddd MMM, D`);

            //Render Current Weather Section 
            document.querySelector(`#current-city`).textContent = currentCity; // Render City
            document.querySelector(`#current-date`).textContent = currentDate ; // Render Date
            weatherCondition(currentIcon); //Get the icon
            document.querySelector(`#current-icon`).className = `fa-solid ${weatherIcon}` // Render Icon
            document.querySelector(`#current-temp`).textContent = currentTemp; // Render Temp
            document.querySelector(`#current-wind`).textContent = currentWind; // Render Wind 
            document.querySelector(`#current-humidity`).textContent = currentHumidity; // Render Humidity 

        })
}

//Fetch Forecast Function 
function getForecastData(cityName){

    //Query URL
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=" + APIKey + "&units=imperial";
    
    fetch (queryURL)
    .then(function (response) {

        //if the response is good...
        if (response.status === 200 ) {
            //check to see if city exists in array... 
            if(!cityNames.includes(cityName)){
                clearButtonStyles();
                createButton(cityName, false, true);
                cityNames.push(cityName);
                //Add to local storage
                localStorage.setItem("cityNames", JSON.stringify(cityNames));
            }

            //clear the input back to placeholder text
            clear(input);
        }
        //if the response isn't good...
        else {
            //clear the input back to placeholder text
            clear(input);

            //Briefly show an error message 
            let error = document.querySelector(`#error-message`);
            error.style.visibility = "visible";

            setTimeout(function(){
                error.style.visibility = "hidden";
            },1500)
        }

        return response.json();
        
    }) 
    .then(function (data){
        console.log(data);
        function organizeData(data){
            const organizedWeather = {};
            data.list.forEach((item) => {
                //destructure weather data
                const{dt, main: {temp_min, temp_max, humidity}, wind:{speed}, weather: [{ main: icon }] } = item;
                //get todays date to exclude from 5 day forecast
                const normalDate = dayjs.unix(dt).format(`ddd`);
                const today = dayjs().format(`ddd`);
                if(normalDate !== today){
                    if(organizedWeather.hasOwnProperty(normalDate)) {
                        organizedWeather[normalDate].temp_min = Math.min(organizedWeather[normalDate].temp_min, temp_min);
                        organizedWeather[normalDate].temp_max = Math.max(organizedWeather[normalDate].temp_max, temp_max);
                        organizedWeather[normalDate].humidity = Math.max(organizedWeather[normalDate].humidity, humidity);
                        organizedWeather[normalDate].speed = Math.max(organizedWeather[normalDate].speed, speed);
                        organizedWeather[normalDate].icon = icon;
                        
                    }
                    else {
                        organizedWeather[normalDate] = {normalDate, temp_min, temp_max, humidity, speed, icon};
                    }
                }
            })
            console.log(organizedWeather);
            return Object.values(organizedWeather);
        }



        const forecast = organizeData(data);
        //Round all numbers
        for (i=0; i < forecast.length; i++){
            forecast[i].temp_min = Math.round(forecast[i].temp_min);
            forecast[i].temp_max = Math.round(forecast[i].temp_max);
            forecast[i].humidity = Math.round(forecast[i].humidity);
            forecast[i].speed = Math.round(forecast[i].speed);
        }
        fiveForecast(forecast);

    });
}



//Function runs on "Search" button click
function findCity(userEntered){
    // Get User Input 
    userEntered = input.value;
    // Capitalize the User Input 
    var multiWord = userEntered.toLowerCase().split(` `);
    for(i = 0; i < multiWord.length; i++){
        multiWord[i] = multiWord[i].charAt(0).toUpperCase() + multiWord[i].slice(1);
    }
    var cityName = multiWord.join(` `);

    getForecastData(cityName);
    getCurrentData(cityName);

}

//Create Today's Weather Function 


//Create Forecast Function
function fiveForecast(x){
    //clear the previous elements
    forecastEl.innerHTML = "";
    for (i=0; i < x.length; i++){
        //card
        var card = document.createElement(`div`);
        card.className = "card column mx-8";
        forecastEl.append(card);
        var cardContent = document.createElement(`div`);
        cardContent.className = "card-content";
        card.append(cardContent);
        //date
        var date = document.createElement(`p`);
        date.className = "title is-5";
        date.textContent = `${x[i].normalDate}`;
        cardContent.append(date);
        //icon
        weatherCondition(x[i].icon);
        var forecastedIcon = document.createElement(`p`);
        forecastedIcon.className = `fa-solid ${weatherIcon}`;
        cardContent.append(forecastedIcon);
        //high temp
        var high = document.createElement(`p`);
        high.textContent = `High: ${x[i].temp_max}`;
        cardContent.append(high);
        //low temp
        var low = document.createElement(`p`);
        low.textContent = `Low: ${x[i].temp_min}`;
        cardContent.append(low);
        //humidity
        var hum = document.createElement(`p`);
        hum.textContent = `Humidity: ${x[i].humidity}`;
        cardContent.append(hum);
        //wind speed
        var wSpeed = document.createElement(`p`);
        wSpeed.textContent = `Wind Speed: ${x[i].speed} MPH`;
        cardContent.append(wSpeed);
    }
}

//Create Button function 
function createButton(cityName, isFirst, isNew){
    var cityButton = document.createElement(`button`);
    cityButton.className = "button is-light mb-8 citybtn"
    cityButton.textContent = cityName;
    //Select the first button in the list on Page Load
    if (isFirst){
        cityButton.classList.add('is-link');
        getForecastData(cityName);
        getCurrentData(cityName);
    }
    if (isNew) {
        cityButton.classList.add('is-link');
    }
    document.querySelector("#city-list").append(cityButton)
    recentBlock.style.visibility = "visible";   
}

//Add Event Listners to City Buttons so Users can select previous searched city. 
document.querySelector("#city-list").addEventListener('click', function(event) {
    if (event.target.classList.contains('citybtn')) {
        clearButtonStyles();
        event.target.classList.add('is-link');
        getForecastData(event.target.textContent);
        getCurrentData(event.target.textContent);
    }
});

function clearButtonStyles(){
    let buttons = document.querySelectorAll('.citybtn');
    buttons.forEach(button => {
        button.classList.remove('is-link');
    });
}

//Function that adds buttons for each element in cityNames
function loadCities(){
    for (i = 0; i < cityNames.length; i++) {
        const cityName = cityNames[i];
        createButton(cityName, i === 0); 
    }
    if(cityNames.length > 0) {
        recentBlock.style.visibility = "visible";
    
    }
}

//Render Cities from Local Storage 
window.addEventListener('load', loadCities);


 //function to clear local storage 
 const clearButton = document.querySelector('#clear').addEventListener('click', function(){
    localStorage.clear();
    document.querySelector('#city-list').innerHTML = "";
    recentBlock.style.visibility = "hidden";
    location.reload();
 });


