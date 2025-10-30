export const sectionExpr = /^\[(.*)]/,
    commentExpr = /[;#](?: )?(.+)/,
    lineExpr = /(^\s*[;#])|(^\[[^\]]*])|(^.+$)/,
    quotedExpr = /^(\s*['"]).+$/;

export const lineTypes = {
    blank: 0,
    comment: 1,
    header: 2,
    pair: 3
};

export const reservedWords = {
    "true": true,
    "false": false,
    "null": null
};

export const systemLineBreak = process && process.platform === 'win32' ? '\r\n' : '\n';

export const isBlankLine = line => line.lineType === lineTypes.blank;
export const isCommentLine = line => line.lineType === lineTypes.comment;
export const isSectionLine = line => sectionExpr.test(line);
