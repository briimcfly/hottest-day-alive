const APIKey = '0040c54f9bc97c402ce34384520d63ae';

function findCity(){
    var city = document.querySelector(`input`).value;
    var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;
    
    fetch (queryURL)
    .then(function (response) {
        return response.json();
    }) 
    .then(function (data){
        console.log(data);
    })
}