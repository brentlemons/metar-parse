var Metar = (function(metarString) {
    const ObservationType = ['METAR', 'SPECI'];
    this.raw = '';
    this.station = '';
    this.type = '';
    this.conditions = '';
}());

Metar.prototype = {

    constructor: Metar,

        raw: metarString,
        station: 'KADS',
        type: 'METAR',
        conditions: 'stuff'
}

module.exports = Metar;