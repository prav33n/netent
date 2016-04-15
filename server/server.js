/**
 * Author : Praveen
 * Description: creates a server that generates 3 random number and calcautes a win or fail status for the numebr genrated.
 * Usage: node server.js ipAddr.
 */
const http = require('http');
const url = require('url');
const fs = require('fs');
const port = 8080; //change this if port 8080 is already in use.
const map = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png'
};

const resource = {"background":"BG.png", "btn_spin":"button.png", "btn_spin_disabled":"button_disabled.png", "symbols": [{"id": 0 ,"name":"wild","image":"symbol0.png"}, {"id": 1 , "name":"strawbery","image":"symbol1.png"},{"id": 2 , "name":"pineapple","image":"symbol2.png"},{"id": 3 , "name":"lemon","image":"symbol3.png"},{"id": 4 , "name":"pear","image":"symbol4.png"},{"id": 5 , "name":"grapes","image":"symbol5.png"}]};
const win = {
    1 : 'Big Win',
    2 : 'Small Win',
    3 : 'No Win'
};

var special = false,
hostname = '127.0.0.1', //Default host ip address.
history = {};

// print process.argv
process.argv.forEach(function (val, index, array) {
  if (index === 2 && val.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/i)) {
    hostname = val;
  } else if (index === 2) {
    console.log('Not a valid IP Binding to ' + hostname);
  }
});

var server = http.createServer().listen(port, hostname, () => {
  console.log('Server running at http://' + hostname + ':' + port + '/');
});

server.on('error', () => {
  console.log('cannot start server - use node server.js ipAddr');
});

server.on('request', function(req, res) {
  var parsedUrl = url.parse(req.url, true);
  var action = parsedUrl.pathname;
  var match = action.match(/.*\.png/i);
    if(match) {
      console.log('serving up image ' + action);
      var fileName = './images/' + action;
      res.writeHead(200, {'Content-Type': map['.png']});
      res.end(readFile(fileName), 'binary');
    }
    switch(parsedUrl.pathname) {
        case '/api':
            res.writeHead(200, {'Content-Type': map['.html'] });
            res.end('<html><body>API Documentation <div>/api/spin - get random values </br> /api/special - to get the win multipler value </div></body></html>');
            break;
        case '/api/special':
            res.writeHead(200, {'Content-Type':  map['.json'] });
            res.writeHead(200, {'Access-Control-Allow-Origin': '*'});
            res.end(JSON.stringify({ "result" : getRandomValue(4)+1 })); //to avoid 0
            break;
        case '/resource.json':
            res.writeHead(200, {'Content-Type':  map['.json'] });
            res.writeHead(200, {'Access-Control-Allow-Origin': '*'});
            res.end(JSON.stringify(resource));
            break;
        case '/api/spin':
            new Promise((resolve, reject) => {
              setTimeout(() => resolve('success'), 3000);
            }).then(data => {
              res.writeHead(200, {'Content-Type':  map['.json'] });
              res.writeHead(200, {'Access-Control-Allow-Origin': '*'});
                var spin = { "result": [ getRandomValue(5), getRandomValue(5), getRandomValue(5)]};
                spin.winStatus = getWinStatus(spin.result);
                spin.special = special;
                res.end(JSON.stringify(spin));
              }, data => {
                res.writeHead(200, {'Content-Type': 'application/json' });
                res.writeHead(200, {'Access-Control-Allow-Origin': '*'});
                res.end(JSON.stringify({"err": data}));
              });
            break;
        default:
            res.writeHead(200, {'Content-Type': map['.html'] });
            res.end('<html><body> Use /api to see Documentation </body></html>');
    }
});

/**
 * Return number on unique items in a Array.
 * @return {int} number of unique elements in an array
 */
Array.prototype.getUniqueCount = function() {
    return new Set(this).size;
};

var readFile = function(fileLocation) {
  if (fs.existsSync(fileLocation)) {
    return fs.readFileSync(fileLocation);
  }
  console.error('file not found' + fileLocation);
  return 'no file found';
}
/**
 * Returns a random value between 0 and end value
 * @param  {[int]} end stop limit for random value
 * @return {[int]} a random numeber between and 0 and end
 */
var getRandomValue = function (end) {
  return Math.floor( Math.random() * parseInt(end));
}

/**
 * Returns a win status based on the unique arrays in the result
 * @param  {Array} Random number array genrated using random function.
 * @return {String} win status based on value passed to the arguement.
 */
var getWinStatus = function (result) {
    var uniqueValue = result.getUniqueCount();
    if(uniqueValue === 1) {
        special = true;
    } else {
        special = false;
    }
    return win [uniqueValue];
}
