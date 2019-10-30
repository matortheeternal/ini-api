const {sectionExpr} = require('./helpers');
const IniLine = require('./iniLine');

class IniSection {
    constructor(text = '') {
        this.lines = [];
        if (typeof text !== 'string')
            throw new Error('Input must be a string.');
        if (text.length === 0) return;
        let match = text.match(sectionExpr);
        this.name = match && match[1];
        this.lines.push(new IniLine(text));
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
        if (line) return line.value;
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

module.exports = IniSection;
