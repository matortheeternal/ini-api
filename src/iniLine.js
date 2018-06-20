class IniLine {
    static _parse(str) {
        let value = '', comment = '', esc = false, out = false,
            quoted = str.match(quotedExpr);
        if (quoted) str = quoted[1];
        for (let char of str) {
            if (out) {
                comment += char;
            } else if (esc || char === '\\') {
                if (esc) value += `\\${char}`;
                esc = !esc;
            } else if (quoted && `'"`.includes(char) || `;#`.includes(char)) {
                out = true;
            } else {
                value += char;
            }
        }
        return [quoted ? value : value.trim(), comment];
    }

    constructor(line) {
        this._text = line;
        this._parseLine();
    }

    _rebuildLine() {
        this._text = `${this._key}=${this._value}`;
        if (this._comment) this._text += `;${this._comment}`;
    }

    _parseLine() {
        let match = this._text.match(lineExpr);
        if (!match) return;
        this.lineType = match.slice(1).findIndex(c => c);
        if (this.lineType !== lineTypes.pair) return;
        this._value = true;
        this._parseKey(match[3] || '');
        this._parseValue(match[4]);
    }

    _parseKey(str) {
        let [key, comment] = IniLine._parse(str || '');
        this._key = key;
        this._comment = comment;
    }

    _parseValue(str) {
        if (this._comment) return this._comment += str;
        let [value, comment] = IniLine._parse(str || '');
        if (reservedWords.hasOwnProperty(value))
            value = reservedWords[value];
        this._value = value;
        this._comment = comment;
    }

    get key() {
        return this._key;
    }

    set key(key) {
        this._key = key;
        this._rebuildLine();
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this._rebuildLine();
    }

    get text() {
        return this._text;
    }

    set text(text) {
        this._text = text;
        this._parseLine();
    }

    comment() {
        if (this.lineType !== lineTypes.pair) return;
        this.text = ';' + this.text;
    }

    uncomment() {
        if (this.lineType !== lineTypes.comment) return;
        let match = this._text.match(commentedPairExpr);
        if (match) this.text = match[1];
    }
}
