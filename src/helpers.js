const sectionExpr = /^\[(.*)]/,
    commentExpr = /[;#](?: )?(.+)/,
    lineExpr = /(^\s*[;#])|(^\[[^\]]*])|(^.+$)/,
    quotedExpr = /^(\s*['"]).+$/;

const lineTypes = {
    blank: 0,
    comment: 1,
    header: 2,
    pair: 3
};

const reservedWords = {
    "true": true,
    "false": false,
    "null": null
};

const systemLineBreak = process && process.platform === 'win32' ? '\r\n' : '\n';

const isBlankLine = line => line.lineType === lineTypes.blank;
const isCommentLine = line => line.lineType === lineTypes.comment;
const isSectionLine = line => sectionExpr.test(line);

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
