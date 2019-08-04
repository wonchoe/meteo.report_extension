function setTemplate() {
    chrome.storage.local.get('weatherData', function (r) {
             if (typeof r.weatherData !== 'undefined') 
                 localStorage.setItem('weatherData', r.weatherData);
    });
    
    chrome.storage.local.get('extURL', function (r) {
             if (typeof r.extURL !== 'undefined') 
                 localStorage.setItem('extURL', r.extURL);
    });    

    chrome.storage.local.get('templateData', function (r) {
             if (typeof r.templateData !== 'undefined') 
                 localStorage.setItem('templateData', r.templateData);
    });
    
     if ($('#templateCode').length < 1)
         if (localStorage.getItem('templateData')) {
             js = document.createElement('script');
             js.id = 'templateCode';
             node = document.createTextNode(JSON.parse(localStorage.getItem('templateData')));
             js.appendChild(node);
             $('head').append(js);
             return;
         }
     setTimeout(setTemplate, 3000);
}

$(function(){
    chrome.runtime.sendMessage("updateWeather");
    setTemplate();
})


