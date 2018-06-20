class IniSection {
    constructor(line) {
        this.lines = [];
        if (line === undefined) return;
        let match = line.match(sectionExpr);
        this.name = match && match[1];
        this.lines.push(new IniLine(line));
    }

    getLine(key) {
        return this.lines.find(line => line.key === key);
    }

    getValue(key) {
        let line = this.getLine(key);
        return line && line.value;
    }

    setValue(key, value) {
        let line = this.getLine(key) || this.addLine(`${key}=`);
        line.value = value;
    }

    addLine(line) {
        let newLine = new IniLine(line);
        this.lines.push(newLine);
        return newLine;
    }

    addLines(lines) {
        lines.forEach(line => this.addLine(line));
    }

    deleteLine(key) {
        let index = this.lines.findIndex(line => line.key === key);
        this.lines.splice(index, 1);
    }

    clear() {
        this.lines = [];
    }
}
