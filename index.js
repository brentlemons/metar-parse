'use strict'

const Metar = require('./lib/metar');

module.exports = metarParser;

function metarParser(metarString) {

    return new Metar(metarString);

    // console.log('=> ' + m.parseTimestamp('150200Z').toISOString());
    // console.log('-> ' + JSON.stringify(m));

}

