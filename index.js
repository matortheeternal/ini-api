const sectionExpr = /^\[(.*)\]/,
    commentExpr = /[;#](?: )?(.+)/,
    lineExpr = /(^\s*[;#])|(^\[[^\]]*\])|(^.+$)/,
    quotedExpr = /^(\s*['"]).+$/,
    lineTypes = {
        blank: 0,
        comment: 1,
        header: 2,
        pair: 3
    },
    reservedWords = {
        "true": true,
        "false": false,
        "null": null
    },
    isBlankLine = line => line.lineType === lineTypes.blank,
    isCommentLine = line => line.lineType === lineTypes.comment,
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