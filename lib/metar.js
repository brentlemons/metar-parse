'use strict';

var moment = require('moment');
var Conditions = require('./conditions');

var parseRegEx = /^(METAR|SPECI)\s(\w{4})\s([0-9]{6}Z)(\sAUTO)?\s(.*)$/;

    /*
    * m[0] = passed string
    * m[1] = type
    * m[2] = station
    * m[3] = time
    * m[4] = auto
    * m[5] = conditions
    */

// var conditionsRegEx = /^(?< **0** wind>(?< **1** direction>\w{3}|\d{3})(?< **2** speed>\d{2})(?:G(?< **3** gustSpeed>\d{2}))?KT(?:\s(?< **4** variableOne>\d{3})V(?< **5** variableTwo>\d{3}))?)?(?:\s)?(?<visibility>(?:(?:(?:[0-9]{1,2})|(?:[0-9]{1,2}\\s[0-9]/[0-9])|(?:[0-9]/[0-9]))SM))?(?<other>.+)(?:\s(?:(?:(?<temperatureNegative>M)?(?<temperature>\d{2}))/(?:(?<dewPointNegative>M)?(?<dewPoint>\d{2}))))(?:\s(?:A(?<altimeter>\d{4})))(?<remainder>.*)$/;

// var conditionsRegEx = /^(?<wind>(?<direction>\w{3}|\d{3})(?<speed>\d{2})(?:G(?<gustSpeed>\d{2}))?KT(?:\s(?<variableOne>\d{3})V(?<variableTwo>\d{3}))?)    ?(?:\s)?(?<visibility>(?:(?:(?:[0-9]{1,2})|(?:[0-9]{1,2}\\s[0-9]/[0-9])|(?:[0-9]/[0-9]))SM))?(?<other>.+)(?:\s(?:(?:(?<temperatureNegative>M)?(?<temperature>\d{2}))/(?:(?<dewPointNegative>M)?(?<dewPoint>\d{2}))))(?:\s(?:A(?<altimeter>\d{4})))(?<remainder>.*)$/;
var conditionsRegEx = /^((\w{3}|\d{3})(\d{2})(?:G(\d{2}))?KT(?:\s(\d{3})V(\d{3}))?)?(?:\s)?((?:(?:(?:[0-9]{1,2})|(?:[0-9]{1,2}\s[0-9]\/[0-9])|(?:[0-9]\/[0-9]))SM)).*$/; //   ?(?<other>.+)(?:\s(?:(?:(?<temperatureNegative>M)?(?<temperature>\d{2}))/(?:(?<dewPointNegative>M)?(?<dewPoint>\d{2}))))(?:\s(?:A(?<altimeter>\d{4})))(?<remainder>.*)$/;
    /*
     * m[0] = wind
     * m[1] = direction
     * m[2] = speed
     * m[3] = gustSpeed
     * m[4] = variableOne
     * m[5] = variableTwo
     * m[6] = visibility



    */




class Metar {

    constructor(metarString) {
        this.raw = metarString;
        this.parseTime = moment.utc();

        var parsed = parseRegEx.exec(metarString);

        if (parsed) {
            this.type = parsed[1].trim();

            this.station = parsed[2];
            
            this.time = this.parseTimestamp(parsed[3]);
            
            this.auto = parsed[4] != undefined;

            this.conditions = this.parseConditions(parsed[5]);

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

    parseConditions(data) {

        var conditions = new Conditions();
        var parsed = conditionsRegEx.exec(data);

        console.log('--> ' + parsed);


        return conditions;

    }

//         private Conditions parseConditions(String data) {
//         Conditions conditions = new Conditions();
//         Pattern pattern = Pattern.compile("^(?<wind>(?<direction>\\w{3}|\\d{3})(?<speed>\\d{2})(?:G(?<gustSpeed>\\d{2}))?KT(?:\\s(?<variableOne>\\d{3})V(?<variableTwo>\\d{3}))?)?(?:\\s)?(?<visibility>(?:(?:(?:[0-9]{1,2})|(?:[0-9]{1,2}\\s[0-9]/[0-9])|(?:[0-9]/[0-9]))SM))?(?<other>.+)(?:\\s(?:(?:(?<temperatureNegative>M)?(?<temperature>\\d{2}))/(?:(?<dewPointNegative>M)?(?<dewPoint>\\d{2}))))(?:\\s(?:A(?<altimeter>\\d{4})))(?<remainder>.*)$");
//         Matcher matcher = pattern.matcher(data);
        
//         if (matcher.find()) {
//             if (matcher.group("wind") != null) conditions.setWind(new Wind(matcher.group("wind")));
//             if (matcher.group("visibility") != null) conditions.setVisibility(parseVisibility(matcher.group("visibility").trim()));
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
//             if (matcher.group("temperature") != null && !matcher.group("temperature").trim().isEmpty()) {
//                 Integer temperature = Integer.valueOf(matcher.group("temperature").trim());
//                 if (matcher.group("temperatureNegative") != null && !matcher.group("temperatureNegative").trim().isEmpty()) {
//                     temperature *= -1;
//                 }
//                 conditions.setTemperature(temperature);
//             }
//             if (matcher.group("dewPoint") != null && !matcher.group("dewPoint").trim().isEmpty()) {
//                 Integer temperature = Integer.valueOf(matcher.group("dewPoint").trim());
//                 if (matcher.group("dewPointNegative") != null && !matcher.group("dewPointNegative").trim().isEmpty()) {
//                     temperature *= -1;
//                 }
//                 conditions.setDewPoint(temperature);
//             }
//             if (matcher.group("altimeter") != null && !matcher.group("altimeter").trim().isEmpty()) {
//                 conditions.setAltimeter(Integer.valueOf(matcher.group("altimeter").trim()) / altimeterDivisor);
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