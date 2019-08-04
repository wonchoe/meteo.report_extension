var mq = window.matchMedia("(min-width: 1273px)");

var weatherBlock = document.createElement('div');
weatherBlock.style.backgroundColor = 'white';
weatherBlock.id = 'weatherBlock';
weatherBlock.style.marginBottom = '20px';

function WidthChange(mq) {
    if (document.getElementById('weatherBlock')) document.getElementById('weatherBlock').remove();
    if (mq.matches) {
        container = document.getElementById('fourthColumnWrapper');
        container.insertAdjacentElement('afterbegin', weatherBlock);
    } else {
        container = document.getElementById('hook_Block_LeftColumnTopCard');
        container.insertAdjacentElement('afterbegin', weatherBlock);
    }
}

function getWeekDay(date, fullName) {
    var days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
    var daysFull = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    return (fullName) ? daysFull[date] : days[date];
}

function tomorrowDate() {
    var today = new Date();
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.getDate() + ' ' + getMonth() + ', ' + getWeekDay(tomorrow.getDay(), false)
}

function getMonth() {
    const monthNames = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    return monthNames[new Date().getMonth()];
}

function getDateFormat() {
    return ('0' + new Date().getHours()).slice(-2) + ':' + ('0' + new Date().getMinutes()).slice(-2) + ', ' + new Date().getDate() + ' ' + getMonth() + ', ' + getWeekDay(new Date().getDay(), false);
}

function setCurrentTime() {
    try {
        $('#curDateTime').html(getDateFormat());
    } catch (e) {
    }
    setTimeout(setCurrentTime, 60000);
}

function setWeatherOKBlock() {
    code = JSON.parse(localStorage.getItem('weatherData'));

    var md = new Date();
    md = 'd' + md.getFullYear() + '-' + ('0' + (md.getMonth() + 1)).slice(-2) + '-' + ('0' + md.getDate()).slice(-2);
    if (code.hasOwnProperty(md)) {
        wData = code[md];
        minDay = (wData.mintempC > 0) ? ('+' + wData.mintempC) : wData.mintempC;
        maxDay = (wData.maxtempC > 0) ? ('+' + wData.maxtempC) : wData.maxtempC;
        astronomy = code[md].astronomy[0];
        sunrise = parseInt(astronomy.sunrise.split(':')[0]);
        sunset = parseInt(astronomy.sunset.split(':')[0]) + 13;

        wData = wData.hourly[new Date().getHours()];

    } else
        exit;


    daytime = ((new Date().getHours() > sunrise) && (new Date().getHours() < sunset)) ? 'day' : 'night'

    iconsURL = localStorage.getItem('extURL')+'icons/';
    picURL = iconsURL + 'weather/' + daytime + '/' + wData.weatherCode + '.png'

    if (document.getElementById('weatherBlock'))
        document.getElementById('weatherBlock').remove();

    if (wData.tempC > 0)
        wData.tempC = '+' + wData.tempC;


// Grab the weather for future

    times = [0, 7, 14, 20]
    names = ['Ночь', 'Утро', 'День', 'Вечер']

    i = 0;
    curIndex = -1;
    curTime = new Date().getHours();
    while (i < times.length) {
        if (curTime < times[i]) {
            curIndex = i;
            break;
        }
        i = i + 1
    }
    if (curIndex == -1)
        curIndex = 0;

    newTimes = new Array();
    newNames = new Array();
    newDateTime = new Array();
    weatherDates = new Array();

    i = 0;

    isTomorrow = 0;

    while (i < 3) {
        if (curIndex >= times.length) {
            curIndex = 0;
            isTomorrow = 1;
        }
        var md = new Date();
        if (isTomorrow == 1)
            md.setDate(md.getDate() + 1);
        md = 'd' + md.getFullYear() + '-' + ('0' + (md.getMonth() + 1)).slice(-2) + '-' + ('0' + md.getDate()).slice(-2);
        weatherDates.push(md);

        i++;
        newDateTime.push(((times[curIndex] > sunrise) && (times[curIndex] < sunset)) ? 'day' : 'night');
        newTimes.push(code[md].hourly[times[curIndex]]);
        newNames.push(names[curIndex]);
        curIndex = curIndex + 1;
    }
// Grab the weather for future

    weatherBlock.innerHTML = '<div class="row cityRow"><div class="cityR column">' + code.area + '</div></div>\
    <div class="tabset">\
    <input type="radio" name="tabset" id="tab1" aria-controls="marzen" checked="checked">\
    <label for="tab1">Сегодня</label>\
    <input type="radio" name="tabset" id="tab2" aria-controls="rauchbier">\
    <label for="tab2">Завтра</label>\
  <div class="tab-panels">\
    <section id="marzen" class="tab-panel">\
    <div class="row langRu" id="curDateTime">' + getDateFormat() + '</div>\
    <div class="row"><div class="column langRu">' + wData.lang_ru[0].value + '</div></div>\
      <div class="row weatherIconRow">\
            <div class="column textR"><img class="imgAbs" src="' + picURL + '"/></div>\
            <div class="column temp">\
            <div style="float:left;margin-top:-3px;">\
            <span style="display:inline">' + wData.tempC + '</span></div>\
            <div style="float:left;font-size:12px;margin-top: 0px;"><span style="display:inline">°C</span></div></div>\
            </div>\
  <input type="checkbox" class="read-more-state" id="advanced" />\
  <div class="read-more-wrap">\
    <div class="read-more-target">\
        <hr class="hr"/>\
      <div class="row rowMargin12"><div class="column humidity">Ветер ' + ((wData.windspeedKmph * 1000) / 60 / 60).toFixed(1) + ' м/с</div></div>\
      <div class="row rowMargin12"><div class="column humidity">Давление ' + wData.pressure + ' мм рт ст</div></div>\
      <div class="row rowMargin12"><div class="column humidity">Влажность ' + wData.humidity + '%</div></div>\
      <hr class="hr"/>\
      <div class="row rowMargin" style="margin-bottom: 2px;">\
            <div class="column">' + newNames[0] + '</div>\
            <div class="column">' + newNames[1] + '</div>\
            <div class="column">' + newNames[2] + '</div>\
      </div>\
      <div class="row" style="margin-bottom: -8px;">\
            <div class="column"><img class="tiB" src="' + iconsURL + 'weather/' + newDateTime[0] + '/' + newTimes[0].weatherCode + '.png' + '"/></div>\
            <div class="column"><img class="tiB" src="' + iconsURL + 'weather/' + newDateTime[1] + '/' + newTimes[1].weatherCode + '.png' + '"/></div>\
            <div class="column"><img class="tiB" src="' + iconsURL + 'weather/' + newDateTime[2] + '/' + newTimes[2].weatherCode + '.png' + '"/></div>\
      </div>\
      <div class="row rowMargin">\
            <div class="column tempForDay">' + ((newTimes[0].tempC > 0) ? '+' + newTimes[0].tempC : +newTimes[0].tempC) + '°</div>\
            <div class="column tempForDay">' + ((newTimes[1].tempC > 0) ? '+' + newTimes[1].tempC : +newTimes[1].tempC) + '°</div>\
            <div class="column tempForDay">' + ((newTimes[2].tempC > 0) ? '+' + newTimes[2].tempC : +newTimes[2].tempC) + '°</div>\
      </div>\
    </div>\
  </div>\
  <label for="advanced" class="read-more-trigger"></label>\
    </section>\
    <section id="rauchbier" class="tab-panel">\
      <div class="row rowMargin"><div class="column dateTomorrow">' + tomorrowDate() + '</div></div>\
      <div class="row rowMargin" style="margin-bottom: 2px;">\
            <div class="column">Ночь</div>\
            <div class="column">Утро</div>\
            <div class="column">День</div>\
            <div class="column">Вечер</div>\
      </div>\
      <div class="row" style="margin-bottom: -8px;">\
            <div class="column"><img class="tiB" src="' + iconsURL + 'weather/night/' + code[weatherDates[1]].hourly[0].weatherCode + '.png' + '"/></div>\
            <div class="column"><img class="tiB" src="' + iconsURL + 'weather/day/' + code[weatherDates[1]].hourly[7].weatherCode + '.png' + '"/></div>\
            <div class="column"><img class="tiB" src="' + iconsURL + 'weather/day/' + code[weatherDates[1]].hourly[14].weatherCode + '.png' + '"/></div>\
            <div class="column"><img class="tiB" src="' + iconsURL + 'weather/day/' + code[weatherDates[1]].hourly[20].weatherCode + '.png' + '"/></div>\
      </div>\
      <div class="row rowMargin" style="margin-bottom: 8px;">\
            <div class="column tempForDay">' + ((code[weatherDates[1]].hourly[0].tempC > 0) ? '+' + code[weatherDates[1]].hourly[0].tempC : code[weatherDates[1]].hourly[0].tempC) + '°</div>\
            <div class="column tempForDay">' + ((code[weatherDates[1]].hourly[7].tempC > 0) ? '+' + code[weatherDates[1]].hourly[7].tempC : code[weatherDates[1]].hourly[7].tempC) + '°</div>\
            <div class="column tempForDay">' + ((code[weatherDates[1]].hourly[14].tempC > 0) ? '+' + code[weatherDates[1]].hourly[14].tempC : code[weatherDates[1]].hourly[14].tempC) + '°</div>\
            <div class="column tempForDay">' + ((code[weatherDates[1]].hourly[20].tempC > 0) ? '+' + code[weatherDates[1]].hourly[20].tempC : code[weatherDates[1]].hourly[20].tempC) + '°</div>\
      </div>\
      <hr class="hr"/>\
      <div class="row rowMargin" style="margin-bottom: 2px;">\
            <div class="column fnt10">' + ((code[weatherDates[1]].hourly[0].windspeedKmph * 1000) / 60 / 60).toFixed(1) + ' м/с<br/>' + code[weatherDates[1]].hourly[0].pressure + ' мм<br/>' + code[weatherDates[1]].hourly[0].humidity + '%</div>\
            <div class="column fnt10">' + ((code[weatherDates[1]].hourly[7].windspeedKmph * 1000) / 60 / 60).toFixed(1) + ' м/с<br/>' + code[weatherDates[1]].hourly[7].pressure + ' мм<br/>' + code[weatherDates[1]].hourly[7].humidity + '%</div>\
            <div class="column fnt10">' + ((code[weatherDates[1]].hourly[14].windspeedKmph * 1000) / 60 / 60).toFixed(1) + ' м/с<br/>' + code[weatherDates[1]].hourly[14].pressure + ' мм<br/>' + code[weatherDates[1]].hourly[14].humidity + '%</div>\
            <div class="column fnt10">' + ((code[weatherDates[1]].hourly[20].windspeedKmph * 1000) / 60 / 60).toFixed(1) + ' м/с<br/>' + code[weatherDates[1]].hourly[20].pressure + ' мм<br/>' + code[weatherDates[1]].hourly[20].humidity + '%</div>\
      </div>\
     </section>\
  </div>\
</div>';
    container = document.getElementById('fourthColumnWrapper');
    container.insertAdjacentElement('afterbegin', weatherBlock);
    setCurrentTime();
    setTimeout(setWeatherOKBlock, 300000);

    mq.addListener(WidthChange);
    WidthChange(mq);
}

setWeatherOKBlock();