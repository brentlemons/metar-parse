'use strict';

var moment = require('moment');
var DescriptorType = require('./descriptor-type');
var PhenomenaType = require('./phenomena-type');

const pattern = new RegExp(
    '^(\\-|\\+|VC)?(' +
    Object.keys(DescriptorType).join('|') +
    ')?(' +
    Object.keys(PhenomenaType).join('|') +
    ')?$');

class PresentWeather {

    constructor(coverage) {
        this.type = null;
        this.altitude = 0;
        this.cloudType = null;

    }

}

module.exports = PresentWeather;
module.exports.pattern = pattern;