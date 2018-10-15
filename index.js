'use strict'

const Metar = require('./lib/metar');

module.exports = metarParser;

function metarParser(metarString) {

    let m = new Metar(metarString);

    console.log('=> ' + m.parseTime('150200Z').toISOString());
    console.log('-> ' + JSON.stringify(m));

}

