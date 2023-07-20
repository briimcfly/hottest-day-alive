fetch (`https://api.openweathermap.org/data/2.5/forecast?lat=44.34&lon=10.99&appid=0040c54f9bc97c402ce34384520d63ae`)
.then(function (response) {
    return response.json();
}) 
.then(function (data){
    console.log(data);
})