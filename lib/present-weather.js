'use strict';

var QualifierType = require('./qualifier-type');
var DescriptorType = require('./descriptor-type');
var PhenomenaType = require('./phenomena-type');

const pattern = new RegExp(
    '^(\\-|\\+|VC)?(' +
    Object.keys(DescriptorType).join('|') +
    ')?(' +
    Object.keys(PhenomenaType).join('|') +
    ')?$');

class PresentWeather {

    constructor(weather) {

        this.symbol = weather;
        this.parseWeather(weather);

    }

    parseWeather(weather) {
        var parsed = pattern.exec(weather);
        if (parsed) {
            var qualifier = parsed[1] != undefined ? parsed[1].trim() : undefined;
            if (qualifier != undefined && qualifier.length > 0) {
                this.qualifier = QualifierType[qualifier];
            }

            var descriptor = parsed[2] != undefined ? parsed[2].trim() : undefined;
            if (descriptor != undefined && descriptor.length > 0) {
                this.descriptor = DescriptorType[descriptor];
            }

            var phenomena = parsed[3] != undefined ? parsed[3].trim() : undefined;
            if (phenomena != undefined && phenomena.length > 0) {
                this.phenomena = PhenomenaType[phenomena];
            }
        }
    }

}

module.exports = PresentWeather;
module.exports.pattern = pattern;