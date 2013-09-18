//check that these node.js modules are avalaible on your system
var http = require('http'),
  fs = require('fs'),
  timers = require('timers'),
  gapis = require('googleapis');

// variable containing your Ingress 'ids'
// How to get them :
// Go to http://www.ingress.com/intel http and NOT https !
// go to the location you want to catch logs
// press F12 (on chrome) and click on the Network tab
// Click on one 'dashboard.getPaginatedPlextsV2' entry and copy paste Cookie and X-CSRFToken values in the variables
var cookie = 'PUT YOUR COOKIE VALUE HERE';
var csrftoken = 'putyourX-CSRFTOkenhere';

//ID of the fusionTable, used to check the date of the last entry
var fusionTable = '1IEoYmBp_Y2drz1G9h6h6B8uAIxLQ_V4GNoU9JzE';
//Orléans
var myfile = 'logOrleans.txt'; //where to write log file
//to get this value, same as above, get value from 'dashboard.getPaginatedPlextsV2', Niantic changed field names, check the comments to know which you have to copy paste
var minLatE6 = 47849016; // pg98bwox95ly0ouu
var minLngE6 = 1827188; //eib1bkq8znpwr0g7
var maxLatE6 = 47956814; //ilfap961rwdybv63
var maxLngE6 = 1987987; //lpf7m1ifx0ieouzq

var requestRunning = false; //is a request still running

//the comm log can be catched from the end date till the start date (reverse order, like in the intel map)
// always received more recent data so need to go back in time till startDate
var startDate = new Date('01-01-2013 00:00:00').getTime(); // format : mm-dd-yyyy hh:mm:ss,this value is replaced by last value in Fusion Table if avalaible
var endDate = new Date().getTime(); //format : mm-dd-yyyy hh:mm:ss , on recup à partir de now

var currentTS = endDate; // dernier timestamp de début reçue
var firstRowTS = 0; //                                                 

var desiredNumItems = 1000;
var lastFetch = false;

init();

function main() {
  try {
    var refresh = setInterval(function () {
      // check if there are still data to fetch by comparing startDate (reverse order!) to the last Timestamp fetch
      //also test if last request return data

      if (!requestRunning) {
        if (currentTS > startDate && !lastFetch) {
          getLogs(startDate, currentTS);
        } else {
          console.log(unixTimeToString(new Date().getTime()), 'nothing to do');
        }
      }
    }, 10000);

    var getlastRow = setInterval(function () {
      if (!requestRunning) {
        getLastDate();
      }
    }, 100000);

  } catch (err) {
    console.log("Error:", err)
  }

}

function init() {
  //create new log file with header
  //Year,Month,Week,Date,Time,Player,Team,Action,AP,Text,Portal,pguid,lat,lng
  var msg = 'Year,Month,Week,Date,Time,Player,Team,Action,AP,Text,Portal,pguid,lat,lng'
  fs.writeFileSync(myfile, msg + '\r\n');

  getLastDate();
  main();
}

function getLastDate() {
  //fetch last row from google fusion table
  console.log('Fetching last line inserted in Google Fusion Table . . .');
  gapis.discover('fusiontables', 'v1').execute(function (err, client) {
    client.fusiontables.query.sql({
      sql: 'Select Time from ' + fusionTable + ' order by Time desc limit 1'
    })
      .withApiKey('you have to put your Google API Key here') //manage your API keys here https://code.google.com/apis/console
      .execute(function (err, result) {

      if (result) {
        startDate = new Date(result.rows[0][0]).getTime() + 1000;
      }
    });
  });

}

function getLogs(minTS, maxTS) {
  if (!requestRunning) {
    requestRunning = true;
    //console.log('requestData: ', unixTimeToString(minTS, true), unixTimeToString(maxTS, true));    
    var myData = ''; // all data chunks received are added to myData.     

    //init
    var content = {
      tmb0vgxgp5grsnhp: desiredNumItems, //good values : 1000 items and loop every 1000 ms
      '0dvtbatgzcfccchh': false,
      pg98bwox95ly0ouu: minLatE6,
      eib1bkq8znpwr0g7: minLngE6,
      ilfap961rwdybv63: maxLatE6,
      lpf7m1ifx0ieouzq: maxLngE6,
      hljqffkpwlx0vtjt: minTS, //minTimestampMs
      sw317giy6x2xj9zm: maxTS, //maxTimestampMs
      '4kr3ofeptwgary2j': 'dashboard.getPaginatedPlextsV2'
    };
    content = JSON.stringify(content);
    var header = {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Origin': 'http://www.ingress.com',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.66 Safari/537.36',
      //'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
      'Accept-Encoding': '', //gzip,deflate,sdch',
      'Accept-Language': 'fr,en-US;q=0.8,en;q=0.6',
      'Content-Length': content.length,
      'Content-Type': 'application/json; charset=UTF-8',
      'Connection': 'keep-alive',
      'Referer': 'http://www.ingress.com/intel',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRFToken': csrftoken,
      'Cookie': cookie
    };

    var requestOptions = {
      hostname: 'www.ingress.com',
      path: '/r/dashboard.getPaginatedPlextsV2',
      method: 'POST',
      headers: header
    };


    var req = http.request(requestOptions, function (res) {
      //console.log('Request : STATUS: ' + res.statusCode + ' - ' + http.STATUS_CODES[res.statusCode]);

      res.on('data', function (chunk) {
        myData += chunk;
        //console.log('Request : receiving data');
      });

      res.on('end', function () {
        //console.log('Request : Data received : ' + myData.length + '\n');

        if (res.statusCode === 200) {
          //console.log('write ' +myData);
          writeData(myData);
        } else {
          console.log('Request : HTTP Return code = ' + res.statusCode + ' ... Aborting');
          requestRunning = false;
          return null;
        };

      });
      res.on('error', function (e) {
        //console.log('Request : problem with request: ' + e.message); 
        requestRunning = false;
      });

    });

    //console.log('Content : ', content);
    req.write(content);
    req.end();

  }
};

function writeData(newData) {
  var obj = JSON.parse(newData);

  if (!obj.result[0]) {
    console('No new data from Ingress Logs');
    requestRunning = false;
    return false;
  }

  var numRowsInData = obj.result.length
  if (numRowsInData < desiredNumItems) {
    lastFetch = true;
  }


  firstRowTS = obj.result[0][1];
  obj.result.forEach(function (json) {
    var d = unixTimeToDate(json[1]);
    var time = unixTimeToString(json[1], true);
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var week = getWeekNumber(d);
    var date = (d.getMonth() + 1) + '-' + d.getDate() + '-' + d.getFullYear();
    currentTS = json[1];
    var team = json[2].plext.team === 'RESISTANCE' ? 'RESISTANCE' : 'ENLIGHTENED';
    var nick = '';
    var nguid = 0;
    var text = deleteSpecialChar(json[2].plext.text);
    var portal = '';
    var pguid = 0;
    var pLat = 0;
    var pLng = 0;
    var AP = 0;
    var action = '';

    json[2].plext.markup.forEach(function (markup) {
      switch (markup[0]) {
      case 'PLAYER':
        nguid = markup[1].guid;
        nick = markup[1].plain;
        team = markup[1].team === 'RESISTANCE' ? 'RESISTANCE' : 'ENLIGHTENED';
        break;
      case 'PORTAL':
        portal = deleteSpecialChar(markup[1].name);
        pguid = markup[1].guid;
        pLat = markup[1].latE6 / 1E6;
        pLng = markup[1].lngE6 / 1E6;
        break;
      case 'TEXT':
        //recherche des actions : captured, deployed, linked, created, destroyed an, destroyed the Link, destroyed a Control
        switch (markup[1].plain) {
        case ' captured ':
          action = 'Capture Portal';
          AP = 500;
          break;
        case ' deployed an ':
          action = 'Deploy Resonator';
          AP = 125;
          break;
        case ' linked ':
          action = 'Create a Link';
          AP = 313;
          break;
        case ' created a Control Field @':
          action = 'Create Control Field';
          AP = 1250;
          break;
        case ' destroyed an ':
          action = 'Destroy Resonator';
          AP = 75;
          break;
        case ' destroyed the Link ':
          action = 'Destroy Link';
          AP = 187;
          break;
        case ' destroyed a Control Field @':
          action = 'Destroy Control Field';
          AP = 750;
          break;
        }
        //console.log(markup[1].plain, action, AP);
        break;
      }
    });

    //only write actions row
    if (action !== '') {
      var msg = year + ',' + month + ',' + week + ',' + date + ',' + time + ',' + nick + ',' + team + ',' + action + ',' + AP + ',' + text + ',' + portal + ',' + pguid + ',' + pLat + ',' + pLng;
      //console.log(msg); 

      fs.appendFile(myfile, msg + '\r\n', function (err) {
        if (err) throw err;
        return false;
      });
    }
    return true;
  });
  requestRunning = false;
  console.log('Logs written : ' + newData.length + ' bytes. Last line written : ' + unixTimeToString(currentTS, true));

};

// Tools 
var unixTimeToString = function (time, full) {
  if (!time) return null;
  var d = new Date(typeof time === 'string' ? parseInt(time) : time);
  var time = d.toLocaleTimeString();
  var date = (d.getMonth() + 1) + '-' + d.getDate() + '-' + d.getFullYear();
  if (typeof full !== 'undefined' && full) return date + ' ' + time;
  if (d.toDateString() == new Date().toDateString())
    return time;
  else
    return date;
}


var unixTimeToDate = function (time) {
  if (!time) return null;
  var d = new Date(typeof time === 'string' ? parseInt(time) : time);
  var date = new Date((d.getMonth() + 1) + '-' + d.getDate() + '-' + d.getFullYear());
  return date;
}

var getWeekNumber = function (d) {
  // Copy date so don't modify original
  d = new Date(d);
  d.setHours(0, 0, 0);
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  // Get first day of year
  var yearStart = new Date(d.getFullYear(), 0, 1);
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  // Return array of year and week number
  return weekNo;
}

//fonction de suppression des , pour �viter les probl�mes lors de l'export vers une DB
var deleteSpecialChar = function (text) {
  while (text.indexOf(',') > 0) {
    text = text.replace(',', '');
  };
  while (text.indexOf('"') > 0) {
    text = text.replace('"', '');
  };
  return text;
}
