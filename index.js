const {lineTypes} =  require('./src/helpers');

module.exports = {
    IniLine: require('./src/IniLine'),
    IniSection: require('./src/IniSection'),
    Ini: require('./src/Ini'),
    lineTypes: lineTypes
};
