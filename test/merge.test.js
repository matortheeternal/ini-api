let {Ini} = require('../dist'),
    path = require('path'),
    fs = require('fs');

describe('Ini.merge', function() {
    let mergedIni;

    let loadIni = function(filename) {
        let filePath = path.resolve(__dirname, `fixtures/${filename}`),
            text = fs.readFileSync(filePath, 'utf8');
        return new Ini(text);
    };

    beforeAll(function() {
        let filenames = ['merge-1.ini', 'merge-2.ini', 'merge-3.ini'],
            inis = filenames.map(loadIni);
        mergedIni = Ini.merge(...inis);
    });

    it('should return a new Ini', function() {
        expect(mergedIni).toBeDefined();
        expect(mergedIni.constructor).toBe(Ini);
    });

    it('should merge sections', function() {
        expect(mergedIni.sections.length).toBe(3);
    });

    it('should merge section lines', function() {
        expect(mergedIni.globals.lines.length).toBe(3);
        expect(mergedIni.globals.lines[2]._text).toBe('; globals 3');
    });

    it('should merge key-value pairs', function() {
        let [section1, section2, section3] = mergedIni.sections,
            testLine = section1.getLine('test');
        expect(section1.getValue('a')).toBe('d');
        expect(testLine).toBeDefined();
        expect(testLine.value).toBe('321');
        expect(testLine.comment).toBe('yo');
        expect(section2.getValue('name')).toBe('George');
        expect(section2.getValue('gender')).toBe('male');
        expect(section3.getValue('2+2')).toBe('4');
    });

    it('should ignore blank lines', function() {
        let [section1, section2, section3] = mergedIni.sections;
        expect(section1.lines.length).toBe(4);
        expect(section2.lines.length).toBe(3);
        expect(section3.lines.length).toBe(3);
    });
});