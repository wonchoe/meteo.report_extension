var code = '';
var codeByDays = '';
var imagesURL = '';
var sunrise = '';
var sunset = '';
var UIlang = chrome.i18n.getUILanguage().slice(0,2);
var condLang = condLang.hasOwnProperty(UIlang) ? condLang[UIlang] : condLang['en'];

$('.localize').each(function(index,item){
    var localizeKey = $(item).data( 'localize' );
    $(item).html(chrome.i18n.getMessage(localizeKey));
});

function parseDate(input) {
    var parts = input.match(/(\d+)/g);
    return new Date(parts[0], parts[1] - 1, parts[2]); // months are 0-based
}

var myChart = new Chart(document.getElementById('weatherChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: chrome.i18n.getMessage('timeLine').split(','),
        datasets: [{
                data: [22, 24, 25, 28, 26, 23, 22, 21],
                backgroundColor: ['#fff5cc'],
                borderColor: ['#ffcc01'],
                borderWidth: 2,
                fill: true,
            }],
    },
    options: {
        events: ['mousemove'],
        onHover: (event, chartElement) => {
            event.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
        },
        elements: {
            point: {
                radius: 0,
                pointStyle: 'rect',
                borderWidth: 0,
                backgroundColor: '#fff',
                hitRadius: 50,
                hoverRadius: 0
            }
        },
        plugins: {
            datalabels: {
                color: '#808080',
                font: function (context) {
                    var index = context.dataIndex;
                    if (($('#weatherChart').attr('data-selected')) && ((context.dataIndex == $('#weatherChart').attr('data-selected'))))
                        return {
                            size: 14,
                            weight: 600
                        }
                    else
                        return {
                            size: 12,
                            weight: 500
                        }
                },
                align: 'top',
                offset: 0,
                formatter: function (value) {
                    return ((value > 0) ? '+' + value : value);
                }
            }
        },
        layout: {
            padding: {
                top: 20,
                left: 20,
                right: 20
            }},
        tooltips: {enabled: false},
        legend: {display: false},
        animation: {duration: 300},
        hover: {animationDuration: 300},
        responsiveAnimationDuration: 300,
        scales: {
            xAxes: [{gridLines: {color: "rgba(0, 0, 0, 0)"}, ticks: {
                        fontSize: 11,
                        fontColor: '#a4a4a4'
                    }}],
            yAxes: [{display: false, gridLines: {color: "rgba(0, 0, 0, 0)"}}]
        }
    }
});

weatherChart.onclick = function (evt) {
    var activePoints = myChart.getElementsAtEvent(evt);
    if (activePoints[0]) {
        var idx = activePoints[0]['_index'];
        $('#weatherChart').attr('data-selected', idx);
        dayTime = ((weatherChart.dataset.selected * 3 > sunrise) && (weatherChart.dataset.selected * 3 < sunset)) ? 'day' : 'night'
        data = codeByDays[weatherChart.dataset.date].hourly[weatherChart.dataset.selected * 3]
        date = parseDate(codeByDays[weatherChart.dataset.date].date);

        $('#dateTime').html(('0' + weatherChart.dataset.selected * 3).slice(-2) + ':00, ' + getWeekDay(date.getDay(), true) + '<br/>' + date.getDate() + ' ' + getMonth(date.getMonth()));
        $('#tempC').html((data.tempC > 0) ? '+' + data.tempC : data.tempC);
        $('#otherInfo').html(                
                (condLang[dayTime].hasOwnProperty(data.weatherCode) ? condLang[dayTime][data.weatherCode] : data.weatherDesc[0].value)+ '<br/>' +
                chrome.i18n.getMessage('wind') + ' ' + ((data.windspeedKmph * 1000) / 60 / 60).toFixed(1) + ' '+chrome.i18n.getMessage('mpers')+'<br/>' +
                chrome.i18n.getMessage('pressure') + ' ' + data.pressure + ' '+chrome.i18n.getMessage('mm')+'<br/>' +
                chrome.i18n.getMessage('humidity') + ' ' + data.humidity + '%');
        
        $('#weatherIcon').html('<img width="64px" src="' + imagesURL + 'weather/' + dayTime + '/' + data.weatherCode + '.png' + '">');
        myChart.update();
    }
};

class Footer {
    constructor(data) {
        this.Index = 0;
        this.dates = new Array();
        this.humidityF = new Array();
        this.windF = new Array();
        this.pressureF = new Array();
        this.condF = new Array();
        this.data = Object.values(data);
        this.data.shift();
        this.data.shift();
    }

    getMaxFrequencyFromArray(data) {
        var mf = 1;
        var m = 0;
        var item;
        for (var i = 0; i < data.length; i++)
        {
            for (var j = i; j < data.length; j++)
            {
                if (data[i] == data[j])
                    m++;
                if (mf < m)
                {
                    mf = m;
                    item = data[i];
                }
            }
            m = 0;
        }
        this.Index = mf;
        return item;
    }

    getDayByDate(date) {
        var days = chrome.i18n.getMessage('days').split(',');
        return days[new Date(date).getDay()];
    }

    getDayByDateFull(date) {
        var daysFull = chrome.i18n.getMessage('daysFull').split(',');
        return daysFull[new Date(date).getDay()];
    }

    getDay() {
        var days = new Array();
        for (var i = 0; i < this.data.length; i++) {
            var obj = this.data[i];
            days.push(this.getDayByDate(parseDate(obj.date)));
        }
        return days;
    }

    getDayFull() {
        var daysFull = new Array();
        for (var i = 0; i < this.data.length; i++) {
            var obj = this.data[i];
            daysFull.push(this.getDayByDateFull(obj.date));
        }
        return daysFull;
    }

    getMinMax() {
        var tempC = new Array();
        for (var i = 0; i < this.data.length; i++) {
            var obj = this.data[i];
            var max = ((obj.maxtempC > 0) ? '+' + obj.maxtempC : obj.maxtempC) + '°';
            var min = ((obj.mintempC > 0) ? '+' + obj.mintempC : obj.mintempC) + '°';
            tempC.push(min + '...' + max);
            this.maxtempC = max;
        }
        return tempC;
    }

    getWeatherIcon() {
        var iconsF = new Array();
        for (var i = 0; i < this.data.length; i++) {
            var icons = new Array();
            var hum = new Array();
            var obj = this.data[i].hourly;
            for (var j = 8; j < 18; j++) {
                icons.push(obj[j].weatherCode);
                hum.push(obj[j].weatherCode);
            }
            iconsF.push(this.getMaxFrequencyFromArray(icons));
            this.humidityF.push(this.data[i].hourly[14].humidity);
            this.windF.push(((this.data[i].hourly[14].windspeedKmph * 1000) / 60 / 60).toFixed(1));
            this.pressureF.push(this.data[i].hourly[14].pressure);
            this.condF.push(this.getMaxFrequencyFromArray(hum));
            this.dates.push(this.data[i].date);
        }
        return iconsF;
    }

    getBlock() {
        this.fullData = {days: this.getDay()};
        this.fullData['daysFull'] = this.getDayFull();
        this.fullData['minmax'] = this.getMinMax();
        this.fullData['icons'] = this.getWeatherIcon();
        this.fullData['humidity'] = this.humidityF;
        this.fullData['wind'] = this.windF;
        this.fullData['cond'] = this.condF;
        this.fullData['pressure'] = this.pressureF;
        this.fullData['dates'] = this.dates;
        return this.fullData;
    }
}

function getWeekDay(date, fullName) {
    var days = chrome.i18n.getMessage('days').split(',');
    var daysFull = chrome.i18n.getMessage('daysFull').split(',');
    return (fullName) ? daysFull[date] : days[date];
}

function getMonth(date = new Date().getMonth()) {
    const monthNames = chrome.i18n.getMessage('month').split(',');
    return monthNames[date];
}

function getDateFormat() {
    return ('0' + new Date().getHours()).slice(-2) + ':' + ('0' + new Date().getMinutes()).slice(-2) + ', ' + getWeekDay(new Date().getDay(), true).toLowerCase() + '</br>' + new Date().getDate() + ' ' + getMonth();
}

function redrawChartAdditional(id) {

    var el = document.querySelector('#weatherChart');
    arr = Object.values(code);
    arr.shift();
    arr.shift();
    obj = arr[el.dataset.date];
    hourly = Object.values(obj.hourly);

    i = 0;
    myChart.data.datasets[0].data = [];
    myChart.data.labels = [];
    while (i < hourly.length) {
        if (id == 0) {
            myChart.options.plugins.datalabels.formatter = function (value) {
                return ((value > 0) ? '+' + value : value);
            }
            myChart.data.datasets[0].backgroundColor = ['#fff5cc'];
            myChart.data.datasets[0].borderColor = ['#ffcc01'];
            myChart.data.datasets[0].data.push(parseInt(hourly[i].tempC));
        }
        if (id == 1) {
            myChart.options.plugins.datalabels.formatter = function (value) {
                return (value > 0) ? +value + '%' : value;
            }
            myChart.data.datasets[0].backgroundColor = ['#e4f9fe'];
            myChart.data.datasets[0].borderColor = ['#46b1e4'];
            myChart.data.datasets[0].data.push(parseInt(hourly[i].humidity));
        }
        if (id == 2) {
            myChart.options.plugins.datalabels.formatter = function (value) {
                return (value > 0) ? +value + ' м/с' : value;
            }
            myChart.data.datasets[0].backgroundColor = ['#d3e0ec'];
            myChart.data.datasets[0].borderColor = ['#aebfcf'];
            myChart.data.datasets[0].data.push(((hourly[i].windspeedKmph * 1000) / 60 / 60).toFixed(1));
        }
        myChart.data.labels.push(('0' + i).slice(-2) + ':00');
        i += 3;
    }
    myChart.data.labels = [];
    myChart.data.labels = chrome.i18n.getMessage('timeLine').split(',');    
    myChart.update();
}

function setTopWeather(ind, icon) {
    var footer = new Footer(code);
    fullData = footer.getBlock();
    $('#dateTime').html(fullData.daysFull[ind] + '<br/> ' + new Date(parseDate(fullData.dates[ind])).getDate() + ' ' + getMonth(new Date(fullData.dates[ind]).getMonth()));
    $('#tempC').html((codeByDays[ind].maxtempC > 0) ? '+' + codeByDays[ind].maxtempC : codeByDays[ind].maxtempC);
    $('#weatherIcon').html('<img width="64px" src="' + imagesURL + 'weather/day/' + icon + '.png' + '">');
    $('#otherInfo').html(
                (condLang['day'].hasOwnProperty(fullData.cond[ind]) ? condLang['day'][fullData.cond[ind]] : fullData.cond[ind])+ '<br/>' +
                chrome.i18n.getMessage('wind') + ' ' + fullData.wind[ind] + ' '+chrome.i18n.getMessage('mpers')+'<br/>' +
                chrome.i18n.getMessage('pressure') + ' ' + fullData.pressure[ind] + ' '+chrome.i18n.getMessage('mm')+'<br/>' +
                chrome.i18n.getMessage('humidity') + ' ' + fullData.humidity[ind] + '%');            
}

function redrawChart(code) {
    myChart.data.datasets[0].backgroundColor = ['#fff5cc'];
    myChart.data.datasets[0].borderColor = ['#ffcc01'];
    myChart.options.plugins.datalabels.formatter = function (value) {
        return (value > 0) ? '+' + value : value;
    }
    tab1Label.click();
    var el = document.querySelector('#weatherChart');
    arr = Object.values(code);
    arr.shift();
    arr.shift();

    obj = arr[el.dataset.date];
    hourly = Object.values(obj.hourly);
    i = 0;
    myChart.data.datasets[0].data = [];
    myChart.data.labels = [];
    while (i < hourly.length) {
        myChart.data.datasets[0].data.push(parseInt(hourly[i].tempC));
        myChart.data.labels.push(('0' + i).slice(-2) + ':00');
        i += 3;
    }
    myChart.data.labels = [];
    myChart.data.labels = chrome.i18n.getMessage('timeLine').split(',');    
    myChart.update();
}

function formatWeatherBlock(code, imagesURL) {
    var md = new Date();
    md = 'd' + md.getFullYear() + '-' + ('0' + (md.getMonth() + 1)).slice(-2) + '-' + ('0' + md.getDate()).slice(-2);

    if (code.hasOwnProperty(md)) {
        wData = code[md];
        $('#area').html(code.area);
        $('#dateTime').html(getDateFormat());
        astronomy = code[md].astronomy[0];
        sunrise = parseInt(astronomy.sunrise.split(':')[0]);
        sunset = parseInt(astronomy.sunset.split(':')[0]) + 13;

        wDataNow = wData.hourly[new Date().getHours()];
        dayTime = ((new Date().getHours() > sunrise) && (new Date().getHours() < sunset)) ? 'day' : 'night'

        $('#weatherIcon').html('<img width="64px" src="' + imagesURL + 'weather/' + dayTime + '/' + wDataNow.weatherCode + '.png' + '">');
        $('#logo').html('<img height="14px" src="' + imagesURL + 'logo.png' + '">');
        $('#tempC').html((wDataNow.tempC > 0) ? '+' + wDataNow.tempC : wDataNow.tempC);
        console.log(wDataNow.weatherCode);
        console.log(dayTime);
        $('#otherInfo').html((condLang[dayTime].hasOwnProperty(wDataNow.weatherCode) ? condLang[dayTime][wDataNow.weatherCode] : wDataNow.weatherDesc[0].value)+ '<br/>' +
                chrome.i18n.getMessage('wind') + ' ' + ((wDataNow.windspeedKmph * 1000) / 60 / 60).toFixed(1) + ' '+chrome.i18n.getMessage('mpers')+'<br/>' +
                chrome.i18n.getMessage('pressure') + ' ' + wDataNow.pressure + ' '+chrome.i18n.getMessage('mm')+'<br/>' +
                chrome.i18n.getMessage('humidity') + ' ' + wDataNow.humidity + '%');
        
        var footer = new Footer(code);
        fullData = footer.getBlock();
        for (i = 0; i < fullData.days.length; i++) {
            var input = document.createElement("input");
            input.type = "radio";
            input.name = 'popupTabsetDown';
            input.id = 'tab_' + i;
            if (i == 0)
                input.setAttribute('checked', true);
            $('#downTabs').append(input);

            var label = document.createElement("label");
            label.setAttribute("for", 'tab_' + i);
            label.class = 'label';
            label.setAttribute('data-id', i);
            label.setAttribute('data-icon', fullData.icons[i]);
            //label.setAttribute('data-code', JSON.stringify(Object.values(code)[i+2]));
            label.style.paddingLeft = '12px';
            label.style.paddingRight = '12px';
            label.onclick = function () {
                var el = document.querySelector('#weatherChart');
                $('#weatherChart').attr('data-selected', -1);
                myChart.update();
                el.dataset.date = this.dataset.id;
                setTopWeather(this.dataset.id, this.dataset.icon);
                redrawChart(code);

            }
            label.innerHTML = '<div class="label">' + fullData.days[i] + '</div><div class="imgDiv">' + '<img width="48px" src="' + imagesURL + 'weather/day/' + fullData.icons[i] + '.png' + '"></div><div>' + fullData.minmax[i] + '</div>';
            $('#downTabs').append(label);

        }
        redrawChart(code);

        tab1Label.onclick = function () {
            redrawChartAdditional(this.dataset.id);
        }
        tab2Label.onclick = function () {
            redrawChartAdditional(this.dataset.id);
        }
        tab3Label.onclick = function () {
            redrawChartAdditional(this.dataset.id);
        }

    } else
        window.stop();

}

function loadImagesURL(code) {
    chrome.storage.local.get('extURL', function (r) {
        if (typeof r.extURL !== 'undefined')
            formatWeatherBlock(code, r.extURL+'icons/');
        imagesURL = r.extURL+'icons/';
    });
}

function loadWeatherCode() {
    chrome.storage.local.get('weatherData', function (r) {
        if (typeof r.weatherData !== 'undefined')
            code = JSON.parse(r.weatherData);
        codeByDays = Object.values(code);
        codeByDays.shift();
        codeByDays.shift();
        loadImagesURL(JSON.parse(r.weatherData));
    });
}

$(function () {
    chrome.runtime.sendMessage("updateWeather");
    loadWeatherCode();
})


