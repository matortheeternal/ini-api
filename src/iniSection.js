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
