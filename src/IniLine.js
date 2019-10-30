const {
    quotedExpr, lineTypes, commentExpr, lineExpr, reservedWords
} = require('./helpers');

class IniLine {
    static _parse(str) {
        let value = '', comment = '', esc = false, inComment = false,
            quoted = str.match(quotedExpr), out = !quoted,
            i = quoted ? quoted[1].length : 0;
        for (i; i < str.length; i++) {
            let char = str[i];
            if (inComment) {
                comment += char;
            } else if ((!quoted || !out) && (esc || char === '\\')) {
                if (esc) value += char;
                esc = !esc;
            } else if (quoted && !out && `'"`.includes(char)) {
                out = true;
            } else if (out && `;#`.includes(char)) {
                inComment = true;
            } else if (out && char === '=') {
                break;
            } else if (!quoted || !out) {
                value += char;
            }
        }
        return [quoted ? value : value.trim(), comment.trim(), i + 1];
    }

    static _escape(str) {
        return str.replace(/[;#=\\]/g, match => `\\${match}`);
    }

    constructor(text) {
        if (typeof text !== 'string')
            throw new Error('Input must be a string.');
        this._text = text;
        this._comment = '';
        this._parseLine();
    }

    _rebuildLine() {
        if (this.lineType === lineTypes.pair) {
            this._text = [this._key, this._value.toString()]
                .map(IniLine._escape).join('=');
            if (this._comment) this._text += ` ; ${this._comment}`;
        } else {
            let newComment = this._comment ? `; ${this._comment}` : '',
                textHasComment = commentExpr.test(this._text);
            if (!textHasComment && !this._comment) return;
            this._text = textHasComment ?
                this._text.replace(commentExpr, newComment) :
                `${this._text} ${newComment}`;
            this._parseLine(); // re-parse to update lineType
        }
    }

    _parseComment() {
        let match = this._text.match(commentExpr);
        this._comment = match ? match[1] : '';
    }

    _parsePair(str) {
        let [key, kComment, index] = IniLine._parse(str);
        this._key = key;
        this._comment = kComment;
        if (index === str.length)
            return this._value = true;
        let [value, vComment] = IniLine._parse(str.slice(index));
        if (reservedWords.hasOwnProperty(value))
            value = reservedWords[value];
        this._value = value;
        this._comment = vComment;
    }

    _parseLine() {
        if (!this._text.trim())
            return this.lineType = lineTypes.blank;
        let match = this._text.match(lineExpr);
        if (!match)
            return this.lineType = lineTypes.blank;
        this.lineType = match.slice(1).findIndex(c => c) + 1;
        if (this.lineType !== lineTypes.pair)
            return this._parseComment();
        this._parsePair(match[3] || '');
    }

    get key() {
        return this._key;
    }

    set key(key) {
        if (this.lineType !== lineTypes.pair)
            throw new Error('Cannot set key for a non-pair line.');
        this._key = key;
        this._rebuildLine();
    }

    get value() {
        return this._value;
    }

    set value(value) {
        if (this.lineType !== lineTypes.pair)
            throw new Error('Cannot set value for a non-pair line.');
        this._value = value;
        this._rebuildLine();
    }

    get comment() {
        return this._comment;
    }

    set comment(text) {
        this._comment = text;
        this._rebuildLine();
    }

    get text() {
        return this._text;
    }

    set text(text) {
        this._text = text;
        this._parseLine();
    }
}

module.exports = IniLine;
