const sectionExpr = /^\[(.*)]/,
    commentExpr = /[;#](?: )?(.+)/,
    lineExpr = /(^\s*[;#])|(^\[[^\]]*])|(^.+$)/,
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
    systemLineBreak = process && process.platform === 'win32' ? '\r\n' : '\n',
    isBlankLine = line => line.lineType === lineTypes.blank,
    isCommentLine = line => line.lineType === lineTypes.comment,
    isSectionLine = line => sectionExpr.test(line);

module.exports = {
    sectionExpr,
    commentExpr,
    lineExpr,
    quotedExpr,
    lineTypes,
    reservedWords,
    systemLineBreak,
    isBlankLine,
    isCommentLine,
    isSectionLine
};
