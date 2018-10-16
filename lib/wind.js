'use strict';

var moment = require('moment');

var parseRegEx = /^(\w{3}|\d{3})(\d{2})(?:G(\d{2}))?KT(?:\s(\d{3})V(\d{3}))?$/;
    /*
     * m[0] = wind
     * m[1] = direction
     * m[2] = speed
     * m[3] = gustSpeed
     * m[4] = variableOne
     * m[5] = variableTwo
    */

class Wind {

    constructor(windString) {
        this.direction = 0;
        this.speed = 0;
        this.gustSpeed = 0;
        this.variable = false;
        this.variableOne = 0;
        this.variableTwo = 0;

        var parsed = parseRegEx.exec(windString);

        if (parsed) {
            var direction = parsed[1] != undefined ? parsed[1].trim() : undefined;
            if (direction != undefined && direction.length > 0 && !/(VRB)|(000)/.test(direction)) {
                this.direction = parseInt(direction);
            } else if (/(VRB)/.test(direction)) {
                this.variable = true;
            } else {
                this.direction = null;
            }

            var speed = parsed[2] != undefined ? parsed[2].trim() : undefined;
            if (speed != undefined && speed.length > 0) {
                this.speed = parseInt(speed);
            } else {
                this.speed = null;
            }

            var gustSpeed = parsed[3] != undefined ? parsed[3].trim() : undefined;
            if (gustSpeed != undefined && gustSpeed.length > 0) {
                this.gustSpeed = parseInt(gustSpeed);
            } else {
                this.gustSpeed = null;
            }

            var variableOne = parsed[4] != undefined ? parsed[4].trim() : undefined;
            var variableTwo = parsed[5] != undefined ? parsed[5].trim() : undefined;
            if ((variableOne != undefined && variableOne.length > 0) &&
                (variableTwo != undefined && variableTwo.length > 0)) {
                this.variable = true;
                this.variableOne = parseInt(variableOne);
                this.variableTwo = parseInt(variableTwo);
            } else {
                this.variableOne = null;
                this.variableTwo = null;
            }

        }

    }

}

module.exports = Wind;