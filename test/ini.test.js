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

        it('should raise a useful exception if a non-string value is passed', function() {
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
        })
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

        it('should support raw lines', function() {
            let text = '[section] ;with comment',
                section = newIni.addSection(text, true);
            expect(section).toBeDefined();
            expect(section.lines[0].text).toBe(text);
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
            newIni.deleteSection('section');
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
                let section = newIni.addSection(key, true),
                    lines = sections[key];
                if (lines) section.addLines(lines);
            });
        });

        it('should serialize without mutation by default', function() {
            let filePath = path.resolve(__dirname, './fixtures/bar.ini'),
                text = fs.readFileSync(filePath, 'utf8');
            expect(newIni.stringify()).toBe(text);
        });

        describe('option: blankLineBeforeSection', function() {
            // TODO
        });

        describe('option: removeBlankLines', function() {
            // TODO
        });

        describe('option: removeCommentLines', function() {
            // TODO
        });
    });
});