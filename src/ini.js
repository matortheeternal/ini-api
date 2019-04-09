class Ini {
    static merge(...inis) {
        let mergeLines = (section, newSection) => {
            let arrayKeys = [];
            section.lines.forEach(line => {
                if (line.lineType === lineTypes.blank ||
                    line.lineType === lineTypes.header) return;
                if (line.key && line.key.endsWith('[]'))
                    return arrayKeys.includes(line.key) ||
                        arrayKeys.push(line.key);
                let newLine = line.lineType === lineTypes.pair &&
                    newSection.getLine(line.key) || newSection.addLine('');
                newLine.text = line.text;
            });
            arrayKeys.forEach(arrayKey => {
                let key = arrayKey.slice(0, -2);
                newSection.setArray(key, section.getArray(key));
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

    constructor(text = '', lineBreak) {
        this.lineBreak = lineBreak || this.determineLineBreak(text)
        if (typeof text !== 'string')
            throw new Error('Input must be a string.');
        this.sections = [];
        let currentSection = this.globals = new IniSection();
        if (text.length === 0) return;
        text.split(this.lineBreak).forEach(line => {
            if (isSectionLine(line)) {
                currentSection = new IniSection(line);
                this.sections.push(currentSection);
            } else {
                currentSection.addLine(line);
            }
        });
    }

    determineLineBreak(text) {
        if(text === '') {
            return typeof process !== 'undefined' &&
                process.platform === 'win32' ? '\r\n' : '\n'
        } else {
            let lineBreak
            if(['\r\n', '\n'].some((t) => {
                if (text.split(t).length > 1) {
                    lineBreak = t
                    return true
                }
            })) {
                return lineBreak
            } else {
                return typeof process !== 'undefined' &&
                    process.platform === 'win32' ? '\r\n' : '\n'
            }
        }
    }

    getSection(name) {
        return this.sections.find(section => section.name === name);
    }

    addSection(name) {
        let newSection = new IniSection(`[${name}]`);
        this.sections.push(newSection);
        return newSection;
    }

    deleteSection(name) {
        let index = this.sections.findIndex(section => section.name === name);
        if (index > -1) this.sections.splice(index, 1);
    }

    clear() {
        this.globals = new IniSection();
        this.sections = [];
    }

    stringify(options = {}) {
        let str = '',
            sections = this.sections.slice();
        if (this.globals.lines.length > 0)
            sections.unshift(this.globals);
        sections.forEach((section, index) => {
            let lines = section.lines.filter(line => {
                return (!options.removeBlankLines || !isBlankLine(line)) &&
                    (!options.removeCommentLines || !isCommentLine(line));
            }).map(line => line.text);
            if (!lines.length) return;
            str += lines.join(this.lineBreak);
            if (index === sections.length - 1) return;
            let lastLine = lines[lines.length - 1];
            if (options.blankLineBeforeSection && !!lastLine.trim())
                str += this.lineBreak;
            str += this.lineBreak;
        });
        return str;
    }
}
