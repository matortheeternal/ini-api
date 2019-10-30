let {Ini, IniSection} = require('../dist'),
    path = require('path'),
    fs = require('fs');

describe('Ini', function() {
    let newIni, newSection;

    beforeAll(function() {
        newIni = new Ini();
    });

    describe('new', function() {
        it('should create an instance of the Ini class', function() {
            expect(newIni).toBeDefined();
            expect(newIni.constructor).toBe(Ini);
        });

        it('should initialize the sections array', function() {
            expect(newIni.sections.length).toBe(0);
        });

        it('should create globals section', function() {
            expect(newIni.globals).toBeDefined();
            expect(newIni.globals.constructor).toBe(IniSection);
            expect(newIni.globals.name).toBeUndefined();
        });

        it('should throw a useful exception if input is not a string', function() {
            expect(() => {
                new Ini(false);
            }).toThrowError(/Input must be a string/);
        });

        describe('deserialization', function() {
            let foo, text;

            beforeAll(function() {
                let filePath = path.resolve(__dirname, './fixtures/foo.ini');
                text = fs.readFileSync(filePath, 'utf8');
                foo = new Ini(text);
            });

            it('should not mutate text when re-serialized', function() {
                expect(foo.stringify()).toBe(text);
            });
        });

        describe('line break parameter', function() {
            it('should use parameter if passed', () => {
                let newIni = new Ini('[x]\r\nb=3', '\r\n');
                expect(newIni.sections[0].lines.length).toBe(2);

                let newIni2 = new Ini('[x]\nb=3', '\r\n');
                expect(newIni2.sections[0].lines.length).toBe(1);
            });

            describe('not passed', () => {
                it('should determine from text', () => {
                    let newIni = new Ini('[x]\r\nb=3');
                    expect(newIni.sections[0].lines.length).toBe(2);

                    let newIni2 = new Ini('[x]\nb=3');
                    expect(newIni2.sections[0].lines.length).toBe(2);
                });

                it('should determine by system if cannot determine by text', () => {
                    let newIni = new Ini('[x]=3');
                    let linebreak = process.platform === 'win32' ? '\r\n' : '\n';
                    expect(newIni.lineBreak).toBe(linebreak);
                });
            });
        });
    });

    describe('addSection', function() {
        let numSections;

        beforeAll(function() {
            numSections = newIni.sections.length;
            newSection = newIni.addSection('new section');
        });

        it('should return the created section', function() {
            expect(newSection).toBeDefined();
            expect(newSection.constructor).toBe(IniSection);
        });

        it('should add section to sections array', function() {
            expect(newIni.sections.length).toBe(numSections + 1);
            expect(newIni.sections[numSections]).toBe(newSection);
        });
    });

    describe('getSection', function() {
        it('should retrieve section if present', function() {
            let section = newIni.getSection('new section');
            expect(section).toBe(newSection);
        });

        it('should return undefined if not present', function() {
            let section = newIni.getSection('not here');
            expect(section).toBeUndefined();
        });
    });

    describe('deleteSection', function() {
        it('should delete the section if present', function() {
            let numSections = newIni.sections.length;
            newIni.deleteSection('new section');
            expect(newIni.sections.length).toEqual(numSections - 1);
        });

        it('shouldn\'t delete any sections if section is not present', function() {
            let numSections = newIni.sections.length;
            newIni.deleteSection('asdf');
            expect(newIni.sections.length).toEqual(numSections);
        });
    });

    describe('clear', function() {
        beforeAll(function() {
            newIni.clear();
        });

        it('should clear globals', function() {
            expect(newIni.globals.lines.length).toBe(0);
        });

        it('should delete all sections', function() {
            expect(newIni.sections.length).toBe(0);
        });
    });

    describe('stringify', function() {
        let globals = ['; globals', '  ', 'a=b', 'derp', '', ' '],
            sections = {
                "[section 1]": ['; a comment', '', 'key=value', '', ''],
                "[empty section]": null,
                "[][_][.123~\\r\\n!@#$%^&*()]": ['lol=wut', '', '"yo" = "sup \\n" ; 1'],
                "[section] ; with comment": ['# the end', '', '', ''],
            };

        beforeAll(function() {
            newIni.clear();
            newIni.globals.addLines(globals);
            Object.keys(sections).forEach(key => {
                let section = new IniSection(key),
                    lines = sections[key];
                if (lines) section.addLines(lines);
                newIni.sections.push(section);
            });
        });

        let loadFixture = function(filename) {
            let filePath = path.resolve(__dirname, `fixtures/${filename}`);
            return fs.readFileSync(filePath, 'utf8');
        };

        it('should serialize without mutation by default', function() {
            let text = loadFixture('bar.ini');
            expect(newIni.stringify()).toBe(text);
        });

        describe('option: blankLineBeforeSection', function() {
            it('should add blank lines before sections missing one', function() {
                let text = loadFixture('bar-blankLineBeforeSection.ini');
                expect(newIni.stringify({
                    blankLineBeforeSection: true
                })).toBe(text);
            });
        });

        describe('option: removeBlankLines', function() {
            it('should remove blank lines', function() {
                let text = loadFixture('bar-removeBlankLines.ini');
                expect(newIni.stringify({
                    removeBlankLines: true
                })).toBe(text);
            });
        });

        describe('option: removeCommentLines', function() {
            it('should remove comment lines', function() {
                let text = loadFixture('bar-removeCommentLines.ini');
                expect(newIni.stringify({
                    removeCommentLines: true
                })).toBe(text);
            });
        });

        describe('all options', function() {
            it('should remove comment and blank lines, but add blank lines before sections', function() {
                let text = loadFixture('bar-all.ini');
                expect(newIni.stringify({
                    blankLineBeforeSection: true,
                    removeBlankLines: true,
                    removeCommentLines: true
                })).toBe(text);
            });
        });
    });
});
