const sectionExpr = /^\[(.*)\]/,
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
        "true": true,
        "false": false,
        "null": null
    },
    isBlankLine = line => line.lineType === lineTypes.blank,
    isCommentLine = line => line.lineType === lineTypes.comment,
    isSectionLine = line => sectionExpr.test(line);

// CLASSES
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

class IniSection {
    constructor(text) {
        this.lines = [];
        if (text === undefined) return;
        if (typeof text !== 'string')
            throw new Error('Input must be a string.');
        let match = text.match(sectionExpr);
        this.name = match && match[1];
        this.lines.push(new IniLine(text, !!match));
    }

    addLine(text) {
        let newLine = new IniLine(text);
        this.lines.push(newLine);
        return newLine;
    }

    addLines(lines) {
        return lines.map(text => this.addLine(text));
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
        let mergeLines = (section, newSection) => {
            section.lines.forEach(line => {
                if (line.lineType === lineTypes.blank ||
                    line.lineType === lineTypes.header) return;
                let newLine = line.lineType === lineTypes.pair &&
                    newSection.getLine(line.key) || newSection.addLine('');
                newLine.text = line.text;
            });
        };

        return inis.reduce((newIni, ini) => {
            mergeLines(ini.globals, newIni.globals);
            ini.sections.forEach(section => {
                let newSection = newIni.getSection(section.name) ||
                    newIni.addSection(section.name);
                mergeLines(section, newSection);
            });
            return newIni;
        }, new Ini());
    }

    constructor(text = '') {
        if (typeof text !== 'string')
            throw new Error('Input must be a string.');
        this.sections = [];
        let currentSection = this._globals = new IniSection();
        if (!text) return;
        text.split('\r\n').forEach(line => {
            if (isSectionLine(line)) {
                currentSection = this.addSection(line, false);
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

    addSection(text, isName = true) {
        if (isName) text = `[${text}]`;
        let newSection = new IniSection(text);
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
                return (!opts.removeBlankLines || !isBlankLine(line)) &&
                    (!opts.removeCommentLines || !isCommentLine(line));
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
    IniLine: IniLine,
    lineTypes: lineTypes
};