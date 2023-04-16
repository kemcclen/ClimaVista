//API Key 
const KEY = "18a0e03809ae9d4ec995202ff530ec95";

//global variables 
const date = new Date ();
var day = date.getDate();
var month = date.getMonth() + 1;
var paddedMonth = String(month).padStart (2, '0');
var year = date.getFullYear();
var cityToSearch = "";

var currentDate = `${year}-${paddedMonth}-${day}`;

var dashboardIcon = document.getElementById ("dashboardIcon");

const DEFAULTCITY = "Toronto";


//saving the searched city in local storage
function saveSearchHistory (searchedCity) {
    if (!localStorage.getItem (searchedCity)) {
        localStorage.setItem (`City: ${searchedCity}`, searchedCity);
    }
}


//displaying the local storage on the page 
function showSearchHistory () {
    let history = document.getElementById ("history");
    while (history.firstChild) {
        history.removeChild (history.firstChild);
    }

//length of search history
    for (let i = 0; i < localStorage.length; i++) {
         //only takes local storage elements with 'City" in key 
        if (localStorage.key (i).includes ("City: ")) {
            //create an li element for each city searched
            let li = document.createElement ("li");
            //create a button element for each city searched
            let button = document.createElement ("button");
            //when value is shown 'city:' is replaced with nothing
            button.innerHTML = localStorage.key (i).replace ("City: ", "");
            //assigning correct values to each button
            button.value = localStorage.key (i);
            button.classList.add ("historyButton")
            button.addEventListener ("click", () => {
                // clicking city button acceeses and shows weather info for that city
                renderCityData (localStorage.key (i))
            });
        
            li.appendChild (button);
            history.append (li);
        }

    }
}
//getting weather for searched city today
function renderCityData (searchedCity) {
    document.getElementById ("city").innerHTML = `${searchedCity.replace ("City: ", "")} (${currentDate})`;
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };
      
    //getting lat and lon data for searched city 
    fetch (`http://api.openweathermap.org/geo/1.0/direct?q=${searchedCity}&limit=5&appid=${KEY}`, requestOptions)
        .then (response => response.json ())
        .then (result => {
            let lat = result[0].lat;
            let lon = result[0].lon;

            //getting forecast for searched city 
            fetch (`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${KEY}`, requestOptions)
                .then (weatherDataResponse => weatherDataResponse.json ())
                .then (weatherDataResult => {
                    //getting icons
                    dashboardIcon.src = `https://openweathermap.org/img/wn/${weatherDataResult.list[0].weather[0].icon}@2x.png`;
                    //converting from Kelvin to Celcius
                    document.getElementById ("temp").innerHTML = Math.round (weatherDataResult.list[0].main.temp - 273) + " ";
                    document.getElementById ("wind").innerHTML = weatherDataResult.list[0].wind.speed + " ";
                    document.getElementById ("humidity").innerHTML = weatherDataResult.list[0].main.humidity + " ";

                    //initalizing variable that tracks the index for the next day
                    let indexOfTomorrow = -1;

                    //finding the correct value of what index of tomorrow is 
                    for (let i = 0; i < weatherDataResult.list.length; i++) {
                        if (parseInt (weatherDataResult.list[i].dt_txt.split ("-")[2]) !== day) {
                            indexOfTomorrow = i;
                            console.log (weatherDataResult.list[indexOfTomorrow]);
                            break;
                        } 
                    }

                    //adjust the time to noon each day
                    indexOfTomorrow += 4;

                    //cutting days to narrow down from next day and 5 days later
                    let filteredweatherDataResult = weatherDataResult.list.slice (indexOfTomorrow);

                    //get the noon time data of each day 
                    let forecastData = filteredweatherDataResult.filter (function (value, index, filteredweatherDataResult) {
                        return index % 8 == 0;
                    });

                    console.log (forecastData);

                    //show all data onto html
                    for (let i = 0; i < forecastData.length; i++) {
                        document.getElementsByClassName ("cardDate")[i].innerHTML = forecastData[i].dt_txt.split (" ")[0];

                        document.getElementsByClassName ("cardIcon")[i].src = `https://openweathermap.org/img/wn/${forecastData[i].weather[0].icon}@2x.png`;
                        
                        document.getElementsByClassName ("cardTemp")[i].innerHTML = Math.round (forecastData[i].main.temp - 273) + " ";

                        document.getElementsByClassName ("cardWind")[i].innerHTML = forecastData[i].wind.speed + " ";

                        document.getElementsByClassName ("cardHumidity")[i].innerHTML = forecastData[i].main.humidity + " ";

                    }
                })
                .catch (error => console.log ('error', error));
        })
        .catch (error => console.log ('error', error));
}
//everything running 
function run () {
    let city = document.getElementById ("citySearch").value;
    if (city !== "") {
        renderCityData (city);
        saveSearchHistory (city);
        showSearchHistory ();
    } else {
        alert ("Please input a city.");
    }
}

renderCityData (DEFAULTCITY);
showSearchHistory ();