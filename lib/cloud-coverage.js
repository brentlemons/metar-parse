'use strict';

var CoverageType = require('./coverage-type');
var CloudType = require('./cloud-type');

const pattern = new RegExp(
    '^(' +
    Object.keys(CoverageType).join('|') +
    '){1}(\\d*)(' +
    Object.keys(CloudType).join('|') +
    ')*.*$');

const altitudeMultiplier = 100;


class CloudCoverage {

    constructor(coverage) {

        this.parseCoverage(coverage);

    }

    parseCoverage(coverage) {
        var parsed = pattern.exec(coverage);
        if (parsed) {
            var type = parsed[1] != undefined ? parsed[1].trim() : undefined;
            if (type != undefined && type.length > 0) {
                this.type = CoverageType[type];
            }

            var altitude = parsed[2] != undefined ? parsed[2].trim() : undefined;
            if (altitude != undefined && altitude.length > 0) {
                this.altitude = parseInt(altitude) * altitudeMultiplier;
            }

            var cloudType = parsed[3] != undefined ? parsed[3].trim() : undefined;
            if (cloudType != undefined && cloudType.length > 0) {
                this.cloudType = CoverageType[cloudType];
            }
        }
    }

}

module.exports = CloudCoverage;
module.exports.pattern = pattern;