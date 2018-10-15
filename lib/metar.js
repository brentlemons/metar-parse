var Metar = (function(metarString) {
    const ObservationType = ['METAR', 'SPECI'];

    return {
        raw: metarString,
        station: 'KADS',
        type: 'METAR',
        conditions: 'stuff'
    };
}());

module.exports = Metar;