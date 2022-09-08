var searchHistory = [];
var weatherApiRootUrl = "https://api.openweathermap.org";

var weatherAPIKey;   // YOUR KEY GOES HERE

// DOM element references
var searchForm = document.querySelector("#search-form");
var searchInput = document.querySelector("#search-input");
var todayContainer = document.querySelector("#today");
var forecastContainer = document.querySelector("#forecast");
var searchHistoryContainer = document.querySelector("#history");

// Function to display the search history list.
function renderSearchHistory() {
  searchHistoryContainer.innerHTML = "";

  // Start at end of history array and count down to show the most recent at the top.
  for (var i = searchHistory.length - 1; i >= 0; i--) {
    var btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-controls", "today forecast");
    btn.classList.add("history-btn", "btn-history");

    // `data-search` allows access to city name when click handler is invoked
    btn.setAttribute("data-search", searchHistory[i]);
    btn.textContent = searchHistory[i];
    searchHistoryContainer.append(btn);
  }
}

// Function to update history in local storage then updates displayed history.
function appendToHistory(search) {
  // If there is no search term return the function
  if (searchHistory.indexOf(search) !== -1) {
    return;
  }
  searchHistory.push(search);

  localStorage.setItem("search-history", JSON.stringify(searchHistory));
  renderSearchHistory();
}

// Function to get search history from local storage
function initSearchHistory() {
  var storedHistory = localStorage.getItem("search-history");
  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory);
  }
  renderSearchHistory();
}

// function to make a card for each day of the forecast
function renderForecastCard(forecast) {
  // variables for data from api
  var unixTs = forecast.dt;
  var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  var iconDescription =
    forecast.weather[0].description || forcast.weather[0].main;
  var tempF = forecast.main.temp;
  var humidity = forecast.main.humidity;
  var windMph = forecast.wind.speed;

  // Create elements for a card
  var col = document.createElement("div");
  var card = document.createElement("div");
  var cardBody = document.createElement("div");
  var cardTitle = document.createElement("h5");

  var weatherIcon = document.createElement("img");
  var tempEl = document.createElement("p");
  var windEl = document.createElement("p");
  var humidityEl = document.createElement("p");

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.setAttribute("class", "col-md");
  col.classList.add("five-day-card");
  card.setAttribute("class", "card bg-primary h-100 text-white");
  cardBody.setAttribute("class", "card-body p-2");
  cardTitle.setAttribute("class", "card-title");
  tempEl.setAttribute("class", "card-text");
  windEl.setAttribute("class", "card-text");
  humidityEl.setAttribute("class", "card-text");

  // Add content to elements
  cardTitle.textContent = dayjs.unix(unixTs).format("M/D/YYYY");
  weatherIcon.setAttribute("src", iconUrl);
  weatherIcon.setAttribute("alt", iconDescription);
  tempEl.textContent = `Temp: ${Math.round(tempF)} °F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  forecastContainer.append(col);
}

// Fetches weather data for given location from the Weather Geolocation
// endpoint; then, calls functions to display current and forecast weather data.
function fetchWeather(location) {
  var { lat } = location;
  var { lon } = location;
  var { name } = location;

  //   get the current waether now, uses city name
  var apiUrlWeather = `https://api.openweathermap.org/data/2.5/weather?appid=${weatherAPIKey}&q=${name}&units=imperial`;

  //   get the forecast, uses lat/lon
  var apiUrlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherAPIKey}`;

  fetch(apiUrlWeather)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      displayCurrentWeather(data);
    })
    .then(function () {
      fetch(apiUrlForecast)
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          displayForecast(data.list);
        })
    })
    .catch(function (err) { 
      console.error(err);
    });
}

function displayCurrentWeather(data) {
  console.log("current weather", data);

  var iconUrl = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
  var iconDescription = data.weather[0].description || data.weather[0].main;

  var card = document.createElement("div");
  var cardBody = document.createElement("div");
  var heading = document.createElement("h2");
  var weatherIcon = document.createElement("img");
  var tempEl = document.createElement("p");
  var windEl = document.createElement("p");
  var humidityEl = document.createElement("p");

  var date = dayjs().format("M/D/YYYY");

  var temp = data.main.temp;
  var windSpeed = data.wind.speed;
  var humidity = data.main.humidity;

  card.setAttribute("class", "card");
  cardBody.setAttribute("class", "card-body");
  card.append(cardBody);

  heading.setAttribute("class", "h3 card-title");
  tempEl.setAttribute("class", "card-text");
  windEl.setAttribute("class", "card-text");
  humidityEl.setAttribute("class", "card-text");

  heading.textContent = `${data.name} ${date}`;
  weatherIcon.setAttribute("src", iconUrl);
  weatherIcon.setAttribute("alt", iconDescription);
  weatherIcon.setAttribute("class", "weather-img");
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${Math.round(temp)} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;
  cardBody.append(heading, tempEl, windEl, humidityEl);

  todayContainer.innerHTML = "";
  todayContainer.append(card);
}

function displayForecast(data) {
  console.log("forecast", data);
  var headingCol = document.createElement("div");
  var heading = document.createElement("h4");

  headingCol.setAttribute("class", "col-12");
  heading.textContent = "-Day Forecast:";
  headingCol.append(heading);

  forecastContainer.innerHTML = "";
  forecastContainer.append(headingCol);

  // access 0900 on each day and jump by 8 for the next day
  for (let i = 5; i < data.length; i += 8) {
    renderForecastCard(data[i]);
    console.log(data[i].dt_txt)  // 11AM pacific time
  }
}

function fetchCoords(search) {
  var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=1&appid=${weatherAPIKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert("Location not found");
      } else {
        console.log(data[0]);
        appendToHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

function handleSearchFormSubmit(e) {
  // Don't continue if there is nothing in the search form
  if (!searchInput.value) {
    return;
  }

  e.preventDefault();
  var search = searchInput.value.trim();
  fetchCoords(search);
  searchInput.value = "";
}

function handleSearchHistoryClick(e) {
  // Don't do search if current elements is not a search history button
  if (!e.target.matches(".btn-history")) {
    return;
  }

  var btn = e.target;
  var search = btn.getAttribute("data-search");
  fetchCoords(search);
}

initSearchHistory();

searchForm.addEventListener("submit", handleSearchFormSubmit);
searchHistoryContainer.addEventListener("click", handleSearchHistoryClick);

//TODO: Timezones
