const {lineTypes} =  require('./src/helpers');

module.exports = {
    Ini: require('./src/ini'),
    IniSection: require('./src/iniSection'),
    IniLine: require('./src/iniLine'),
    lineTypes: lineTypes
};
