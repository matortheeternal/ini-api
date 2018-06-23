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
