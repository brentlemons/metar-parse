'use strict'

var metar = require('./lib/metar');

module.exports = metarParser;

function metarParser(metarString) {

    var m = new metar(metarString);

    console.log('-> ' + m);

}

