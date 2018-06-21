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

class IniSection {
    constructor(line) {
        this.lines = [];
        if (line === undefined) return;
        if (typeof line !== 'string')
            throw new Error('Input must be a string.');
        let match = line.match(sectionExpr);
        this.name = match && match[1];
        this.lines.push(new IniLine(line));
    }

    addLine(line) {
        let newLine = new IniLine(line);
        this.lines.push(newLine);
        return newLine;
    }

    addLines(lines) {
        return lines.map(line => this.addLine(line));
    }

    getLine(key) {
        return this.lines.find(line => line.key === key);
    }

    deleteLine(key) {
        let index = this.lines.findIndex(line => line.key === key);
        if (index === -1) return;
        this.lines.splice(index, 1);
    }

    clear() {
        this.lines = this.name ? this.lines.slice(0, 1) : [];
    }

    getValue(key) {
        let line = this.getLine(key);
        return line && line.value;
    }

    setValue(key, value) {
        let line = this.getLine(key) || this.addLine(`${key}=`);
        line.value = value;
        return line;
    }

    getArray(key) {
        let arrayKey = key + '[]';
        return this.lines.filter(line => {
            return line.key === arrayKey || line.key === key;
        }).map(line => line.value);
    }

    setArray(key, array) {
        let arrayKey = key + '[]',
            arrayLines = array.map(value => {
                return new IniLine(`${arrayKey}=${value}`)
            });
        this.lines = this.lines.filter(line => {
            return line.key !== arrayKey && line.key !== key;
        }).concat(arrayLines);
        return arrayLines;
    }
}

class Ini {
    static merge(...inis) {
        return inis.reduce((newIni, ini) => {
            ini.sections.forEach(section => {
                let newSection = newIni.getSection(section.name) ||
                    newIni.addSection(section.name);
                section.lines.forEach(line => {
                    let newLine = line.lineType === lineTypes.pair &&
                        newSection.getLine(line.key) ||
                        newSection.addLine('');
                    newLine.text = line.text;
                });
            });
            return newIni;
        }, newIni);
    }

    constructor(text = '') {
        if (typeof text !== 'string')
            throw new Error('Input must be a string.');
        this.sections = [];
        let currentSection = this._globals = new IniSection();
        text.split('\r\n').forEach(line => {
            if (isSectionLine(line)) {
                currentSection = this.addSection(line, true);
            } else {
                currentSection.addLine(line);
            }
        });
    }

    get globals() {
        return this._globals;
    }

    getSection(name) {
        return this.sections.find(section => section.name === name);
    }

    addSection(line, isLine = false) {
        if (!isLine) line = `[${line}]`;
        let newSection = new IniSection(line);
        this.sections.push(newSection);
        return newSection;
    }

    deleteSection(name) {
        let index = this.sections.findIndex(section => section.name === name);
        if (index > -1) this.sections.splice(index, 1);
    }

    clear() {
        this._globals = new IniSection();
        this.sections = [];
    }

    stringify(opts = {}) {
        let str = '',
            sections = this.sections.slice();
        if (this._globals.lines.length > 0)
            sections.unshift(this._globals);
        sections.forEach(section => {
            let lines = section.lines.filter(line => {
                return !opts.removeBlankLines || line.text.trim() &&
                    !opts.removeCommentLines || !isCommentLine(line);
            }).map(line => line.text);
            if (!lines.length) return;
            let lastLine = lines[lines.length - 1];
            str += lines.join(lineBreak);
            if (opts.blankLineBeforeSection && !!lastLine.trim())
                str += lineBreak;
            str += lineBreak;
        });
        return str.slice(0, 0 - lineBreak.length);
    }
}


module.exports = {
    Ini: Ini,
    IniSection: IniSection,
    IniLine: IniLine
};