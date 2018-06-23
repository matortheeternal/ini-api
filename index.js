const sectionExpr = /^\[([^\]]*)\]/,
    commentExpr = /[;#](?: )?(.+)/,
    lineExpr = /(^\s*[;#])|(^\[[^\]]*\])|(^.+$)/,
    quotedExpr = /^(\s*['"]).+$/,
    lineBreak = typeof process !== 'undefined' &&
        process.platform === 'win32' ? '\r\n' : '\n',
    lineTypes = {
        blank: 0,
        comment: 1,
        header: 2,
        pair: 3
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
    IniLine: IniLine,
    lineTypes: lineTypes
};