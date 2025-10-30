export default function(lib) {
    const { IniSection, IniLine } = lib;
    describe('IniSection', function () {
        let emptySection, newSection, fakeSection, newLine;

        beforeAll(function () {
            emptySection = new IniSection();
            newSection = new IniSection('[new section]');
            fakeSection = new IniSection('; [comment not header]');
        });

        describe('new', function () {
            it('should create an instance of the IniSection class', function () {
                expect(emptySection).toBeDefined();
                expect(emptySection).toBeInstanceOf(IniSection);
            });

            it('should initialize the lines array', function () {
                expect(emptySection.lines).toBeDefined();
                expect(emptySection.lines.length).toBe(0);
            });

            it('should not initialize name if no line is passed', function () {
                expect(emptySection.name).toBeUndefined();
            });

            it('should initialize name if a header line is passed', function () {
                expect(newSection).toBeDefined();
                expect(newSection.name).toBe('new section');
            });

            it('should put line into lines array if a header line is passed', function () {
                expect(newSection.lines).toBeDefined();
                expect(newSection.lines.length).toBe(1);
                expect(newSection.lines[0].text).toBe('[new section]');
            });

            it('should initialize name to null if a non-header line is passed', function () {
                expect(fakeSection).toBeDefined();
                expect(fakeSection.name).toBe(null);
            });

            it('should put line into lines array if a non-header line is passed', function () {
                expect(fakeSection.lines).toBeDefined();
                expect(fakeSection.lines.length).toBe(1);
                expect(fakeSection.lines[0].text).toBe('; [comment not header]');
            });

            it('should throw a useful exception if input is not a string', function () {
                expect(() => {
                    new IniSection(false);
                }).toThrowError(/Input must be a string/);
            });
        });

        describe('addLine', function () {
            let numLines;

            beforeAll(function () {
                numLines = newSection.lines.length;
                newLine = newSection.addLine('key=value ; comment');
            });

            it('should return the created line', function () {
                expect(newLine).toBeDefined();
                expect(newLine).toBeInstanceOf(IniLine);
            });

            it('should add an line to lines array', function () {
                expect(newSection.lines.length).toBe(numLines + 1);
                expect(newSection.lines[numLines]).toBe(newLine);
            });
        });

        describe('addLines', function () {
            let numLines, newLines;

            beforeAll(function () {
                numLines = newSection.lines.length;
                newLines = newSection.addLines(['', 'a=b', '; hello world', '']);
            });

            it('should return the created lines', function () {
                expect(newLines).toBeDefined();
                expect(newLines).toBeInstanceOf(Array);
                expect(newLines.length).toBe(4);
            });

            it('should add the lines to lines array', function () {
                expect(newSection.lines.length).toBe(numLines + 4);
                newSection.lines.slice(numLines).forEach((line, n) => {
                    expect(line).toBe(newLines[n]);
                });
            });
        });

        describe('getLine', function () {
            it('should retrieve line if present', function () {
                let line = newSection.getLine('key');
                expect(line).toBe(newLine);
            });

            it('should return undefined if not present', function () {
                let line = newSection.getLine('not present');
                expect(line).toBeUndefined();
            });
        });

        describe('deleteLine', function () {
            it('should delete the line if present', function () {
                let numLines = newSection.lines.length;
                newSection.deleteLine('a');
                expect(newSection.lines.length).toEqual(numLines - 1);
            });

            it('shouldn\'t delete any lines if line is not present', function () {
                let numLines = newSection.lines.length;
                newSection.deleteLine('asdf');
                expect(newSection.lines.length).toEqual(numLines);
            });
        });

        describe('clear', function () {
            it('should delete all lines except section header if present', function () {
                newSection.clear();
                expect(newSection.lines.length).toBe(1);
            });

            it('should delete all lines if section header is not present', function () {
                emptySection.addLines(['; test', '']);
                emptySection.clear();
                expect(emptySection.lines.length).toBe(0);
            });
        });

        describe('getValue', function () {
            beforeAll(function () {
                newLine = newSection.addLine('a=b');
            });

            it('should return value assocaited with key if present', function () {
                let value = newSection.getValue('a');
                expect(value).toBe('b');
            });

            it('should return undefined if key is not present', function () {
                let value = newSection.getValue('asdf');
                expect(value).toBeUndefined();
            });
        });

        describe('setValue', function () {
            let line;

            beforeAll(function () {
                line = newSection.setValue('a', '123');
                newLine = newSection.setValue('hello', 'world');
            });

            it('should set value and return line if key is present', function () {
                expect(line).toBeDefined();
                expect(line).toBeInstanceOf(IniLine);
                expect(line.value).toBe('123');
            });

            it('should add line and return it if key is not present', function () {
                expect(newLine).toBeDefined();
                expect(newLine).toBeInstanceOf(IniLine);
                expect(newLine.value).toBe('world');
            });
        });

        describe('getArray', function () {
            beforeAll(function () {
                newSection.clear();
                newSection.addLines(['a[]=1', 'a[]=2', 'a[]=3', 'a[]=4']);
                newSection.addLines(['b=1', 'b=2', 'b=3', 'b=4']);
            });

            it('should return array if present', function () {
                let a = newSection.getArray('a');
                expect(a).toBeDefined();
                expect(a).toBeInstanceOf(Array);
                expect(a.length).toBe(4);
                for (let i = 0; i < a.length; i++)
                    expect(a[i]).toBe(`${i + 1}`);
            });

            it('should treat repeating non-array keys as array', function () {
                let b = newSection.getArray('b');
                expect(b).toBeDefined();
                expect(b).toBeInstanceOf(Array);
                expect(b.length).toBe(4);
                for (let i = 0; i < b.length; i++)
                    expect(b[i]).toBe(`${i + 1}`);
            });

            it('should return an empty array if key not present', function () {
                let c = newSection.getArray('c');
                expect(c).toBeDefined();
                expect(c).toBeInstanceOf(Array);
                expect(c.length).toBe(0);
            });
        });

        describe('setArray', function () {
            let lines, numLines;

            beforeAll(function () {
                newSection.clear();
                numLines = newSection.lines.length;
                lines = newSection.setArray('a', ['9', '8', '7']);
            });

            it('should create array lines and and return them if not present', function () {
                expect(lines).toBeDefined();
                expect(lines).toBeInstanceOf(Array);
                expect(lines.length).toBe(3);
                expect(newSection.lines.length).toBe(numLines + 3);
                for (let i = 0; i < lines.length; i++)
                    expect(lines[i].text).toBe(`a[]=${9 - i}`);
            });

            it('should replace array lines and return them if present', function () {
                let chars = ['a', 'b', 'c'];
                lines = newSection.setArray('a', chars);
                expect(lines).toBeDefined();
                expect(lines).toBeInstanceOf(Array);
                expect(lines.length).toBe(3);
                expect(newSection.lines.length).toBe(numLines + 3);
                for (let i = 0; i < lines.length; i++)
                    expect(lines[i].text).toBe(`a[]=${chars[i]}`);
            });
        });
    });
}
