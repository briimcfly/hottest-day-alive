const APIKey = config.MY_KEY;
const input = document.querySelector(`input`);
const recentBlock = document.querySelector('#recent');
const forecastEl = document.querySelector(`#fiveday`);

//Check local storage for any stored results 
let storedCities = localStorage.getItem("cityNames");

//If data exists, parse it.. else, return an empty array
let cityNames = storedCities ? JSON.parse(storedCities) : [];

console.log(storedCities);

//a function for clearing fields
function clear(element){
    element.value="";
}

//Fetch Function 
function getData(cityName){

    //Query URL
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=" + APIKey + "&units=imperial";
    
    fetch (queryURL)
    .then(function (response) {
  

        //if the response is good...
        if (response.status === 200 ) {
            //check to see if city exists in array... 
            if(!cityNames.includes(cityName)){
                createButton(cityName);
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
                const{dt, main: {temp_min, temp_max, humidity}, wind: {speed} } = item;
                //get todays date to exclude from 5 day forecast
                const normalDate = dayjs.unix(dt).format(`ddd`);
                const today = dayjs().format(`ddd`);
                if(normalDate !== today){
                    if(organizedWeather.hasOwnProperty(normalDate)) {
                        organizedWeather[normalDate].temp_min = Math.min(organizedWeather[normalDate].temp_min, temp_min);
                        organizedWeather[normalDate].temp_max = Math.max(organizedWeather[normalDate].temp_max, temp_max);
                        organizedWeather[normalDate].humidity = Math.max(organizedWeather[normalDate].humidity, humidity);
                        organizedWeather[normalDate].speed = Math.max(organizedWeather[normalDate].speed, speed);
                    }
                    else {
                        organizedWeather[normalDate] = {normalDate, temp_min, temp_max, humidity, speed};
                    }
                }
            })
            return Object.values(organizedWeather);
        }



        const forecast = organizeData(data);
        console.log(forecast);
        console.log(forecast[0].normalDate);
        console.log(forecast.length);
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

    getData(cityName);

}



//Create Forecast Function
function fiveForecast(x){
    //clear the previous elements
    forecastEl.innerHTML = "";
    for (i=0; i < x.length; i++){
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
        //high
        var high = document.createElement(`p`);
        high.textContent = `High: ${x[i].temp_max}`;
        cardContent.append(high);
        //low
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
function createButton(cityName){
    var cityButton = document.createElement(`button`);
    cityButton.className = "button is-light mb-8 citybtn"
    cityButton.textContent = cityName;
    document.querySelector("#city-list").append(cityButton)
    recentBlock.style.visibility = "visible";    
}

//Add Event Listners to City Buttons so Users can select previous searched city. 
document.querySelector("#city-list").addEventListener('click', function(event) {
    if (event.target.classList.contains('citybtn')) {
        const buttons = document.querySelectorAll('.citybtn');
        buttons.forEach(button => {
            button.classList.remove('is-link');
        });
        console.log(event.target.textContent);
        event.target.classList.add('is-link');
        getData(event.target.textContent);
    }
});

//Function that adds buttons for each element in cityNames
function loadCities(){
    for(const cityName of cityNames) {
        createButton(cityName);
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


