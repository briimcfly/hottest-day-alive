const APIKey = config.MY_KEY;
const input = document.querySelector(`input`);
const recentBlock = document.querySelector('#recent');

//Check local storage for any stored results 
let storedCities = localStorage.getItem("cityNames");

//If data exists, parse it.. else, return an empty array
let cityNames = storedCities ? JSON.parse(storedCities) : [];

console.log(storedCities);

//a function for clearing fields
function clear(element){
    element.value="";
}

//Function runs on "Search" button click
function findCity(){
    // Get User Input 
    var userEntered = input.value;
    // Capitalize the User Input 
    var multiWord = userEntered.toLowerCase().split(` `);
    for(i = 0; i < multiWord.length; i++){
        multiWord[i] = multiWord[i].charAt(0).toUpperCase() + multiWord[i].slice(1);
    }
    var cityName = multiWord.join(` `);

    //Query URL
    var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
    
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
    //    error.show(); 
    })


}


//Create Button function 
function createButton(cityName){
    var cityButton = document.createElement(`button`);
    cityButton.className = "button is-light"
    cityButton.textContent = cityName;
    document.querySelector("#city-list").append(cityButton)
    recentBlock.style.visibility = "visible";
}

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
