const sectionExpr = /^\[([^\]]*)\]/,
    lineExpr = /(^\s*[;#])|(^([^=;#]+)(?:=(.*))?$)/,
    quotedExpr = /^\s*['"](.+)$/,
    commentedPairExpr = /^\s*(?:[;#]+([^=]+(=(.*))?))$/,
    lineBreak = typeof process !== 'undefined' &&
        process.platform === 'win32' ? '\r\n' : '\n',
    lineTypes = {
        comment: 0,
        pair: 1
    },
    reservedWords = {
        true: true,
        false: false,
        null: null
    },
    isCommentLine = line => line.lineType === lineType.comment,
    isSectionLine = line => sectionExpr.test(line);

// CLASSES
//= require src/iniLine.js
//= require src/iniSection.js
//= require src/ini.js

module.exports = {
    Ini: Ini,
    IniSection: IniSection,
    IniLine: IniLine
};