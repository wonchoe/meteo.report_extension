chrome.runtime.onMessageExternal.addListener(
  function(message, sender, sendResponse){
      sendResponse({result: true});
  });


function dec2hex(dec) {
    return ('0' + dec.toString(16)).substr(-2)
}

function generateId(len) {
    var arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
}

function loadWeatherData() {
    navigator.geolocation.getCurrentPosition(function (p) {

        lsHash = localStorage.getItem('loadHash');
        hash = ((lsHash) && (lsHash.length == 32)) ? localStorage.getItem('loadHash') : generateId(32);

        uniqueID = localStorage.getItem('uniqueID');
        uniqueID = ((uniqueID) && (uniqueID.length == 24)) ? localStorage.getItem('uniqueID') : false;

        if (!uniqueID) {
            uniqueID = generateId(24);
            localStorage.setItem('uniqueID', uniqueID);
        }

        try {
            $.get('https://api.meteo.report/weather/get/lat=' + p.coords.latitude.toFixed(4) + '&lon=' + p.coords.longitude.toFixed(4) + '&hash=' + hash + '&uniqueID=' + uniqueID, function (response) {

                if (response.result) {
                    chrome.storage.local.set({lastUpdate: new Date().getTime()}, function () { });

                    if (response.template)
                        templateData = JSON.parse(JSON.stringify(response.template));

                    if (response.updateInterval)
                        localStorage.setItem('updateInterval', response.updateInterval);

                    if (response.hash)
                        localStorage.setItem('loadHash', response.hash);

                    chrome.storage.local.set({'weatherData': JSON.stringify(response.weather)}, function () {});
                    chrome.storage.local.set({'extURL': chrome.extension.getURL('/')}, function () {});
                    chrome.storage.local.set({'templateData': JSON.stringify(templateData)}, function () {});

                }
            });
        } catch (e) {
            log('Error connection to the host');
        }
    })
}

chrome.runtime.onInstalled.addListener(function (details) {
    localStorage.removeItem('loadHash');
    loadWeatherData();
});


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    chrome.storage.local.get(['lastUpdate'], function (r) {

        updateInterval = localStorage.getItem('updateInterval') || 8;

        currentDifference = (r.lastUpdate) ? Math.round((new Date().getTime() - r.lastUpdate) / 1000 / 60 / 60) : 0;

        if (currentDifference < 0)
            currentDifference = 9;

        if (((r.lastUpdate) && (currentDifference >= updateInterval)) || (!r.lastUpdate)) {
            loadWeatherData()
        }
    });
});