'use strict';

var moment = require('moment');
var Conditions = require('./conditions');
var Wind = require('./wind');
var CoverageType = require('./coverage-type');
var CloudCoverage = require('./cloud-coverage');
var PresentWeather = require('./present-weather');
var QualifierType = require('./qualifier-type');

const altimeterDivisor = 100.0;

var parseRegEx = /^(METAR|SPECI)(\sCOR)?\s(\w{4})\s([0-9]{6}Z)(\sAUTO)?\s(.*)$/;

    /*
    * m[0] = passed string
    * m[1] = type
    * m[2] = correction
    * m[3] = station
    * m[4] = time
    * m[5] = auto
    * m[6] = conditions
    */

// var conditionsRegEx = /^(?< **0** wind>(?< **1** direction>\w{3}|\d{3})(?< **2** speed>\d{2})(?:G(?< **3** gustSpeed>\d{2}))?KT(?:\s(?< **4** variableOne>\d{3})V(?< **5** variableTwo>\d{3}))?)?(?:\s)?(?<visibility>(?:(?:(?:[0-9]{1,2})|(?:[0-9]{1,2}\\s[0-9]/[0-9])|(?:[0-9]/[0-9]))SM))?(?<other>.+)(?:\s(?:(?:(?<temperatureNegative>M)?(?<temperature>\d{2}))/(?:(?<dewPointNegative>M)?(?<dewPoint>\d{2}))))(?:\s(?:A(?<altimeter>\d{4})))(?<remainder>.*)$/;

// var conditionsRegEx = /^(?<wind>(?<direction>\w{3}|\d{3})(?<speed>\d{2})(?:G(?<gustSpeed>\d{2}))?KT(?:\s(?<variableOne>\d{3})V(?<variableTwo>\d{3}))?)    ?(?:\s)?(?<visibility>(?:(?:(?:[0-9]{1,2})|(?:[0-9]{1,2}\\s[0-9]/[0-9])|(?:[0-9]/[0-9]))SM))?(?<other>.+)(?:\s(?:(?:(?<temperatureNegative>M)?(?<temperature>\d{2}))/(?:(?<dewPointNegative>M)?(?<dewPoint>\d{2}))))(?:\s(?:A(?<altimeter>\d{4})))(?<remainder>.*)$/;
var conditionsRegEx = /^((\w{3}|\d{3})(\d{2})(?:G(\d{2}))?(?:(?:KT)|(?:MPS))(?:\s(\d{3})V(\d{3}))?)?(?:\s)?((?:(?:\d{4})|(?:(?:[0-9]{1,2})|(?:[0-9]{1,2}\s[0-9]\/[0-9])|(?:[0-9]\/[0-9]))SM))?(.+)?(?:\s(?:(?:(M)?(\d{2}))\/(?:(M)?(\d{2}))))(?:\s(?:A|Q(\d{4})))(.*)$/;
    /*
     * m[1] = wind
     * m[2] = direction
     * m[3] = speed
     * m[4] = gustSpeed
     * m[5] = variableOne
     * m[6] = variableTwo
     * m[7] = visibility
     * m[8] = other?
     * m[9] = temperatureNegative
     * m[10] = temperature
     * m[11] = dewPointNegative
     * m[12] = dewPoint
     * m[13] = altimeter
     * m[14] = remainder
    */

        // Matcher matcher = Pattern.compile("^(?<visibility>(?<meters>\\d{4})|(?:(?:(?<wholeVis>[0-9]{1,2})|(?<wholeFractionVis>(?<wfvWhole>[0-9]{1,2})\\s(?<wfvNumerator>[0-9])/(?<wfvDenominator>[0-9]))|(?<fractionVis>(?<fvNumerator>[0-9])/(?<fvDenominator>[0-9])))SM))$").matcher(visibility);
var visibilityRegEx = /^((\d{4})|(?:(?:([0-9]{1,2})|(([0-9]{1,2})\s([0-9])\/([0-9]))|(([0-9])\/([0-9])))SM))$/;
    /*
     * m[1] = visibility
     * m[2] = meters
     * m[3] = wholeVis
     * m[4] = wholeFractionVis
     * m[5] = wfvWhole
     * m[6] = wfvNumerator
     * m[7] = wfvDenominator
     * m[8] = fractionVis
     * m[9] = fvNumerator
     * m[10] = fvDenominator
    */



class Metar {

    constructor(metarString) {

        // console.log('=====>> ' + QualifierType['-']);
        this.raw = metarString;
        this.parseTime = moment.utc();

        var parsed = parseRegEx.exec(metarString);

        if (parsed) {
            this.type = parsed[1].trim();

            this.correction = parsed[2] != undefined;

            this.station = parsed[3];
            
            this.time = this.parseTimestamp(parsed[4]);
            
            this.auto = parsed[5] != undefined;

            this.conditions = this.parseConditions(this.time, parsed[6]);

            // if (!m.group("station").trim().isEmpty() && this.station == null) {
            //     this.station = new Station(m.group("station").trim());
            // }
            
            // if (m.group("time") != null && !m.group("time").isEmpty()) {
            //     this.time = this.parseTime(m.group("time").trim());
            // }
                        
            // if (m.group("conditions") != null && !m.group("conditions").isEmpty()) {
            //     this.conditions = parseConditions(m.group("conditions").trim());
            // }

        } else {
            console.log('didnt parse');
        }

    }

    parseTimestamp(timestamp) {
        var now = moment.utc();
        var day = 0, hour = 0, minute = 0;

        var m = /^([0-9]{2})([0-9]{2})([0-9]{2})?Z?$/.exec(timestamp);
        if (m) {
            day = parseInt(m[1]);
            hour = parseInt(m[2]);
            minute = m.length > 3 ? parseInt(m[3]) : 0;
        }
                
        //TODO: This can be improved by looking at actual days in the month
        if (now.date() - day > 7) {
            now = now.add(1, 'months').date(day);
        } else if (day - now.date() > 1) {
            now = now.subtract(1, 'months').date(day);
        } else {
            now = now.date(day);
        }
        
        if (hour > 23) {
            now = now.add(1, 'days');
            hour = 0;
        }
        
        now = now.hour(hour).minute(minute).second(0).millisecond(0);
        
        return now;
    }

    parseConditions(time, data) {

        console.log('--> ' + data);
        var conditions = new Conditions();
        conditions.valid = time;
        var parsed = conditionsRegEx.exec(data);

        if (parsed) {
            conditions.wind = new Wind(parsed[1]);

            var visibility = this.parseVisibility(parsed[7]);
            if (visibility != undefined) {
                conditions.visibility = visibility;
            }

            var temperature = parsed[10] != undefined ? parsed[10].trim() : undefined;
            if (temperature != undefined && temperature.length > 0) {
                conditions.temperature = parseInt(temperature);
                if (parsed[9] != undefined) { // it has an M
                    conditions.temperature *= -1;
                }
            }

            var dewPoint = parsed[12] != undefined ? parsed[12].trim() : undefined;
            if (dewPoint != undefined && dewPoint.length > 0) {
                conditions.dewPoint = parseInt(dewPoint);
                if (parsed[11] != undefined) { // it has an M
                    conditions.dewPoint *= -1;
                }
            }

            var altimeter = parsed[13] != undefined ? parsed[13].trim() : undefined;
            if (altimeter != undefined && altimeter.length > 0) {
                conditions.altimeter = parseFloat(altimeter) / altimeterDivisor;
            }

            var weather = parsed[8] != undefined ? parsed[8].trim() : undefined;
            if (weather != undefined && weather.length > 0) {
                var wx = weather.split(' ');
                console.log(wx);

                wx.forEach(item => {
                    if (CloudCoverage.pattern.test(item)) {
                        conditions.coverage.push(new CloudCoverage(item));
                        console.log('this is cloudCoverage -> ' + item);
                    } else if (PresentWeather.pattern.test(item)) {
                        conditions.presentWeather.push(new PresentWeather(item));
                        console.log('this is presentWeather -> ' + item);
                    }
                });

            }

            conditions.ceiling = this.calculateCeiling(conditions.coverage);

        }

        return conditions;

    }

    parseVisibility(visibility) {

        var parsed = visibilityRegEx.exec(visibility);

        if (parsed) {
            if (parsed[2] != undefined) {
                return parseFloat(parsed[2].trim());
            } else if (parsed[3] != undefined) {
                return parseFloat(parsed[3].trim());
            } else if (parsed[4] != undefined) {
                var value = 0.0;
                if (parsed[5] != undefined) {
                    value = parseFloat(parsed[5].trim());
                }
                if (parsed[6] != undefined && parsed[7] != undefined) {
                    value += (parseFloat(parsed[6].trim()) / parseFloat(parsed[7].trim()));
                }
                return value;
            } else if (parsed[8] != undefined) {
                if (parsed[9] != undefined && parsed[10] != undefined) {
                    return (parseFloat(parsed[9].trim()) / parseFloat(parsed[10].trim()));
                }
            }
        }
        
        return undefined;
    }

    calculateCeiling(coverage) {

        const maxValue = 100000;
        var retValue = maxValue;

        if (coverage != null && coverage.length > 0) {
            coverage.forEach(cloud => {
                if ((cloud.type != null && cloud.altitude != null) && 
                    (cloud.type == CoverageType['BKN'] || cloud.type == CoverageType['OVC'] || cloud.type == CoverageType['VV']) && 
                    cloud.altitude < retValue) {
                    retValue = cloud.altitude;
                }
            });
        }

        return retValue != maxValue ? retValue : null;
    }    


    //     private Integer calculateCeiling(List<CloudCoverage> coverage) {
    //     Integer retValue = 100000;
        
    //     if (coverage != null) {     
    //         for (CloudCoverage cloud : coverage) {
    //             if ((cloud.getType() != null && cloud.getAltitude() != null) && (cloud.getType() == CoverageType.BKN || cloud.getType() == CoverageType.OVC || cloud.getType() == CoverageType.VV) && cloud.getAltitude() < retValue) {
    //                 retValue = cloud.getAltitude();
    //             }
    //         }
    //     }
        
    //     if (retValue == 100000) {
    //         retValue = null;
    //     }
        
    //     return retValue;
    // }



//             if (matcher.group("other") != null && !matcher.group("other").trim().isEmpty()) {
//                 String[] elements = matcher.group("other").trim().split("\\s");
//                 for (String element : elements) {
//                     Matcher coverageMatcher = CloudCoverage.pattern.matcher(element);
//                     Matcher wxMatcher = PresentWeather.pattern.matcher(element);
//                     if (coverageMatcher.find()) {
//                         conditions.addCloudCoverage(new CloudCoverage(element));
//                     } else if (wxMatcher.find()) {
//                         conditions.addPresentWeather(new PresentWeather(element));
//                     } else {
//                         conditions.addUnknown(element);
//                     }
//                 }
//                 conditions.setCeiling(calculateCeiling(conditions.getCoverage()));
//                 conditions.setFlightCategory(calculateFlightCategory(conditions.getCeiling(), conditions.getVisibility()));
//             }
//             if (matcher.group("remainder") != null && !matcher.group("remainder").trim().isEmpty()) {
// //              logger.error("remarks: " + matcher.group("remarks").trim());
//             }
//         } else {
//             logger.error("FAILED TO MATCH PATTERN: " + data);
//         }
        
//         return conditions;
//     }


}

module.exports = Metar;