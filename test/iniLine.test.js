let {IniLine, lineTypes} = require('..');

describe('IniLine', function() {
    describe('new', function() {
        it('should throw a useful exception if input is not a string', function() {
            expect(() => {
                new IniLine(false);
            }).toThrow(/Input must be a string/);
        });

        describe('blank line', function() {
            let blankLine;

            beforeAll(function() {
                blankLine = new IniLine('');
            });

            it('should set lineType to lineTypes.blank', function() {
                expect(blankLine.lineType).toBe(lineTypes.blank);
            });

            it('should set _text to an empty string', function() {
                expect(blankLine._text).toBe('');
            });

            it('should set _comment to an empty string', function() {
                expect(blankLine._comment).toBe('');
            });

            it('should leave other properties undefined', function() {
                expect(blankLine._key).toBeUndefined();
                expect(blankLine._value).toBeUndefined();
            });
        });

        describe('comment line', function() {
            let commentLine;

            beforeAll(function() {
                commentLine = new IniLine('; comment');
            });

            it('should set lineType to lineTypes.comment', function() {
                expect(commentLine.lineType).toBe(lineTypes.comment);
            });

            it('should set _text', function() {
                expect(commentLine._text).toBe('; comment');
            });

            it('should set _comment', function() {
                expect(commentLine._comment).toBe('comment');
            });

            it('should leave other properties undefined', function() {
                expect(commentLine._key).toBeUndefined();
                expect(commentLine._value).toBeUndefined();
            });

            it('should work with hash comments', function() {
                commentLine = new IniLine('#hash comment');
                expect(commentLine.lineType).toBe(lineTypes.comment);
                expect(commentLine._text).toBe('#hash comment');
                expect(commentLine._comment).toBe('hash comment');
                expect(commentLine._key).toBeUndefined();
                expect(commentLine._value).toBeUndefined();
            });
        });

        describe('header line', function() {
            let headerLine;

            beforeAll(function() {
                headerLine = new IniLine('[header] ; comment');
            });

            it('should set lineType to lineTypes.header', function() {
                expect(headerLine.lineType).toBe(lineTypes.header);
            });

            it('should set _text', function() {
                expect(headerLine._text).toBe('[header] ; comment');
            });

            it('should set _comment', function() {
                expect(headerLine._comment).toBe('comment');
            });

            it('should leave other properties undefined', function() {
                expect(headerLine._key).toBeUndefined();
                expect(headerLine._value).toBeUndefined();
            });

            it('should set _comment to an empty string if not provided', function() {
                headerLine = new IniLine('[header]');
                expect(headerLine.lineType).toBe(lineTypes.header);
                expect(headerLine._text).toBe('[header]');
                expect(headerLine._comment).toBe('');
                expect(headerLine._key).toBeUndefined();
                expect(headerLine._value).toBeUndefined();
            });
        });

        describe('key-value pair', function() {
            let line;

            let testLine = function(text, key, value, comment) {
                line = new IniLine(text);
                expect(line._text).toBe(text);
                expect(line._key).toBe(key);
                expect(line._value).toBe(value);
                expect(line._comment).toBe(comment);
            };

            beforeAll(function() {
                line = new IniLine('a=b ; comment');
            });

            it('should set lineType to lineTypes.pair', function() {
                expect(line.lineType).toBe(lineTypes.pair);
            });

            it('should set _text', function() {
                expect(line._text).toBe('a=b ; comment');
            });

            it('should set _key', function() {
                expect(line._key).toBe('a');
            });

            it('should set _value', function() {
                expect(line._value).toBe('b');
            });

            it('should set _comment', function() {
                expect(line._comment).toBe('comment');
            });

            it('should ignore unquoted whitespace', function() {
                testLine('\t a  =  b    ;   comment   ', 'a', 'b', 'comment');
            });

            it('should handle double quotes', function() {
                testLine('" a " = "  b " ; comment', ' a ', '  b ', 'comment');
            });

            it('should handle single quotes', function() {
                testLine("' a ' = '  b ' ; comment", ' a ', '  b ', 'comment');
            });

            it('should handle hash comments', function() {
                testLine('a=b#comment', 'a', 'b', 'comment');
            });

            it('should handle escaped quotes', function() {
                testLine(`"\\"a\\""='\\'b\\'' #'`, '"a"', "'b'", '\'');
            });

            it('should handle escaped equal signs', function() {
                testLine('a\\==\\=b #=', 'a=', '=b', '=');
            });

            it('should handle escaped comment characters', function() {
                testLine('a\\;\\#=b\\;\\# #c', 'a;#', 'b;#', 'c');
            });

            it('should set _comment to an empty string if not provided', function() {
                testLine('a=b', 'a', 'b', '');
            });

            describe('reserved words', function() {
                it('should handle null', function() {
                    testLine('a=null', 'a', null, '');
                });

                it('should handle true', function() {
                    testLine('a=true', 'a', true, '');
                });

                it('should handle false', function() {
                    testLine('a=false', 'a', false, '');
                });
            });
        });
    });

    describe('get key', function() {
        it('should return _key if present', function() {
            let line = new IniLine('key=value');
            expect(line.key).toBe('key');
        });

        it('should return undefined if not present', function() {
            let line = new IniLine('');
            expect(line.key).toBeUndefined();

        });
    });

    describe('set key', function() {
        let line;

        beforeAll(function() {
            line = new IniLine('a=b ; comment')
        });

        it('should set _key', function() {
            line.key = 'key';
            expect(line._key).toBe('key');
        });

        it('should update _text', function() {
            expect(line._text).toBe('key=b ; comment');
        });

        it('should throw a useful exception for non-pair lines', function() {
            expect(() => {
                let line = new IniLine('');
                line.key = 'key';
            }).toThrow(/Cannot set key for a non-pair line/);
        });
    });

    describe('get value', function() {
        it('should return _value if present', function() {
            let line = new IniLine('key=value');
            expect(line.value).toBe('value');
        });

        it('should return undefined if not present', function() {
            let line = new IniLine('');
            expect(line.value).toBeUndefined();
        });
    });

    describe('set value', function() {
        let line;

        beforeAll(function() {
            line = new IniLine('a=b ; comment')
        });

        it('should set _value', function() {
            line.value = 'value';
            expect(line._value).toBe('value');
        });

        it('should update _text', function() {
            expect(line._text).toBe('a=value ; comment');
        });

        it('should throw a useful exception for non-pair lines', function() {
            expect(() => {
                let line = new IniLine('');
                line.value = 'value';
            }).toThrow(/Cannot set value for a non-pair line/);
        });
    });

    describe('get comment', function() {
        it('should return _comment', function() {
            let line = new IniLine('a=b ; comment');
            expect(line.comment).toBe('comment');
        });

        it('should return an empty string if not present', function() {
            let line = new IniLine('');
            expect(line.comment).toBe('');
        });
    });

    describe('set comment', function() {
        let line;

        beforeAll(function() {
            line = new IniLine('a=b ; comment')
        });

        it('should set _comment', function() {
            line.comment = 'blarg';
            expect(line._comment).toBe('blarg');
        });

        it('should update _text', function() {
            expect(line._text).toBe('a=b ; blarg');
        });

        it('should update _lineType', function() {
            line = new IniLine('');
            line.comment = 'comment';
            expect(line.lineType).toBe(lineTypes.comment);
        });
    });

    describe('get text', function() {
        it('should return _text', function() {
            let text = 'a=b ; comment',
                line = new IniLine(text);
            expect(line.text).toBe(text);
        });
    });

    describe('set text', function() {
        let line;

        beforeAll(function() {
            line = new IniLine('a=b ; comment')
        });

        it('should set _text', function() {
            line.text = '';
            expect(line._text).toBe('');
        });

        it('should update lineType', function() {
            expect(line.lineType).toBe(lineTypes.blank);
        });
    });

    describe('escaping when setting key/value', function() {
        let line;

        beforeAll(function() {
            line = new IniLine('a=b ; comment')
        });

        it('should escape comment characters', function() {
            line.key = 'a#';
            line.value = '#b';
            expect(line._text).toBe('a\\#=\\#b ; comment');
        });

        it('should escape equals sign', function() {
            line.key = 'a=';
            line.value = '=b';
            expect(line._text).toBe('a\\==\\=b ; comment');
        });

        it('should escape backslash', function() {
            line.key = 'a\\';
            line.value = '\\b';
            expect(line._text).toBe('a\\\\=\\\\b ; comment');
        });
    });
});
