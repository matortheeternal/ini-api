# ini-api 
[![Tests](https://github.com/matortheeternal/ini-api/actions/workflows/tests.yml/badge.svg)](https://github.com/matortheeternal/ini-api/actions/workflows/tests.yml) [![codecov](https://codecov.io/gh/matortheeternal/ini-api/branch/master/graph/badge.svg)](https://codecov.io/gh/matortheeternal/ini-api)

A clean class-based API for parsing, editing, and creating INI files. 

# Table of contents

[Installation & usage](#installation--usage)  

**API:**

* [Ini](#ini)
  * [constructor](#constructortext)
  * [getSection](#getsectionname)
  * [addSection](#addsectiontext)
  * [deleteSection](#deletesectionname)
  * [clear](#clear)
  * [stringify](#stringifyoptions)
  * [Ini.merge](#inimergeinis)
* [IniSection](#inisection)
  * [constructor](#constructortext-1)
  * [addLine](#addlinetext)
  * [addLines](#addlineslines)
  * [getLine](#getlinekey)
  * [deleteLine](#deletelinekey)
  * [clear](#clear-1)
  * [getValue](#getvaluekey)
  * [setValue](#setvaluekey-value)
  * [getArray](#getarraykey)
  * [setArray](#setarraykey-array)
* [IniLine](#iniline)
  * [constructor](#constructortext-2)
  * [key](#key)
  * [value](#value)
  * [comment](#comment)
  * [text](#text)
* [lineTypes](#linetypes)

# Installation & usage

```
npm i ini-api
```

Note: As of v2.0.1, this library ships with both ESM and CommonJS builds. Use whichever import style matches your project.

### Using ES modules (recommended)
```js
import { Ini, IniSection, IniLine, lineTypes } from 'ini-api';

const myIni = new Ini('; ini text here');
```

### Using CommonJS

```javascript
let { Ini, IniSection, IniLine, lineTypes } = require('ini-api');
let myIni = new Ini('; ini text here');
```

# API

## Ini
Class for interfacing with Ini files.  Contains an array of IniSections in the `sections` property and a single globals section in the `globals` property.

### `constructor([text])`

Creates a new instance of the Ini class, parsing the `text` passed.

**arguments:**  
`text` (optional) the text to parse

**returns:**
The new Ini.

**examples:**
```javascript
import { Ini } from 'ini-api';
import fs from 'fs';
import path from 'path';

// creates an empty Ini file
const emptyIni = new Ini();

// creates an ini file with a section named "section"
const newIni = new Ini('[section]\r\na=b\r\n; comment');

// loading an ini file from disk
const text = fs.readFileSync('config.ini');
const configIni = new Ini(text);
```

### `getSection(name)`

Gets the first section matching `name` if present.

**arguments:**  
`name` the name of the section to get.

**returns:**  
The matching IniSection if present.  Returns undefined if a matching section wasn't found.

**examples:**  
```javascript
ini.getSection('section');
```

### `addSection(name)`

Adds a new section to the Ini.

**arguments:**  
`text` the name of the section to add.  

**returns:**  
The new IniSection.

**examples:**  
```javascript
ini.addSection('section');
```

### `deleteSection(name)`

Deletes the first section matching `name` if present.

**arguments:**  
`name` the name of the section to delete.

**returns:**  
Nothing.

**examples:**  
```javascript
ini.deleteSection('section');
```

### `clear()`

Removes all of the Ini's sections and clears the globals section.

**returns:**  
Nothing.

**examples:**  
```javascript
ini.clear();
```

### `stringify([options])`

Converts the Ini to a string.

**arguments**
`options` (optional) additional options for customization.  Object with supported fields:
* `blankLineBeforeSection` (default: `false`) Ensures there is a blank line before 
* `removeBlankLines` (default: `false`) Removes all blank lines (except blank lines added through the `blankLineBeforeSection` option)
* `removeCommentLines` (default: `false`) Removes all comment lines.  Comments after key-value pairs/headers are preserved.

### `Ini.merge(...inis)`

Combines two or more Inis into a new Ini.  Blank lines are stripped, but comments are preserved.  Merges key-value pairs, including arrays (the last version of the array is used).

**arguments:**  
`...inis` the inis to merge.

**returns:**  
The new merged Ini.

**examples:**  
```javascript
const ini1 = new Ini('[section]\r\na=b\r\n\r\n; comment');
const ini2 = new Ini('[section]\r\n\r\na=c\r\n');
const ini3 = new Ini('; global comment\r\n\r\n[section 2]\r\nhello=world');
const mergedIni = Ini.merge(ini1, ini2, ini3);
console.log(mergedIni.stringify());
/*
; global comment
[section]
a=c
; comment
[section 2]
hello=world
*/
```

## IniSection

Class for interfacing with Ini sections.  Contains an array of IniLines in the `lines` property and a `name` property.  Note: the `name` property will be undefined if the section does not have a valid section header.

### `constructor(text)`

Creates a new instance of the IniSection class, treating the `text` passed as the first line.

**arguments:**  
`text` (optional) the first line of the IniSection

**returns:**
The new IniSection.

**examples:**
```javascript
// creates an empty IniSection with no name or lines
const emptySection = new IniSection('');

// creates a section named "section"
const section = new IniSection('[section]');
```

### `addLine(text)`

Adds a new line to the section.

**arguments:**  
`text` the text of the line to add.  

**returns:**  
The new IniLine.

**examples:**  
```javascript
section.addLine('a=b');
```

### `addLines(lines)`

Adds multiple lines to the section.

**arguments:**  
`lines` array of strings to add as new lines.  

**returns:**  
Array of new IniLines.

**examples:**  
```javascript
section.addLines(['a=b', 'hello=world', 'key=value ; comment', ' ']);
```

### `getLine(key)`

Gets the first key-value pair line matching `key` if present.

**arguments:**  
`key` the key of the key-value pair line to get.

**returns:**  
The matching IniLine if present.  Returns undefined if a matching line wasn't found.

**examples:**  
```javascript
section.getLine('key');
```

### `deleteLine(key)`

Deletes the first key-value pair line matching `key` if present.

**arguments:**  
`key` the key of the key-value pair line to delete.

**returns:**  
Nothing.

**examples:**  
```javascript
section.deleteLine('key');
```

### `clear()`

Removes all lines from the section except the header line if present.

**returns:**  
Nothing.

**examples:**  
```javascript
section.clear();
```

### `getValue(key)`

Gets the value of the first key-value pair line matching `key` if present.

**arguments:**  
`key` the key of the key-value pair line to get the value of.

**returns:**  
The value of the IniLine if present.  Returns undefined if a matching line wasn't found.


**examples:**  
```javascript
const section = new IniSection('[section]');
section.addLine('a=b');
section.getValue('a'); // returns b
```

### `setValue(key, value)`

Sets the value of the first key-value pair line matching `key` if present.

**arguments:**  
`key` the key of the key-value pair line to get the value of.  
`value` the value to set.

**returns:**  
The matching IniLine if present.  Returns undefined if a matching line wasn't found.

**examples:**  
```javascript
const section = new IniSection('[section]');
section.addLine('a=b');
section.getValue('a'); // returns b
```

### `getArray(key)`

Gets the value of the key-value array corresponding to `key` if present.

**arguments:**  
`key` the key of the array to get the value of, excluding the `[]`.  

**returns:**  
An array of the values found.  Returns an empty array if no matching lines were found.

**examples:**  
```javascript
const section = new IniSection('[section]');
section.addLines(['a[]=1', 'a[]=2', 'a[]=3']);
section.getArray('a'); // returns [1, 2, 3]
```

### `setArray(key, array)`

Clears any existing array at `key` and creates a new array with values corresponding to the values in `array`;

**arguments:**  
`key` the key of the array to set the value of, excluding the `[]`.    
`array` the array of values to apply.    

**returns:**  
An array of the created IniLines.

**examples:**  
```javascript
const section = new IniSection('[section]');
section.addLines(['a[]=1', 'a[]=2', 'a[]=3']);
section.setArray('a', [9, 8, 7]);
section.getArray('a'); // returns [9, 8, 7]
```

## IniLine

Class for interfacing with Ini lines.  Stores the line's type in the `lineType` property.

### `constructor(text)`

Creates a new instance of the IniLine class, treating the `text` as the line's text.

**arguments:**  
`text` the line's text

**returns:**
The new IniLine.

**examples:**
```javascript
const blankLine = new IniLine('');
const commentLine = new IniLine('; comment');
const headerLine = new IniLine('[header]');
const pairLine = new IniLine('key = value ; comment');
```

### `key`

Getter/setter for line key.  Note: attempting to set the key of a line that does not have a key-value pair will raise an exception.

**examples:**  
```javascript
const line = new IniLine('a=b ; comment')
console.log(line.key); // output: 'a'
line.key = 'new key';
console.log(line.text); // output: new key=b ; comment
```

### `value`

Getter/setter for line value.  Note: attempting to set the value of a line that does not have a key-value pair will raise an exception.

**examples:**  
```javascript
const line = new IniLine('a=b ; comment')
console.log(line.value); // output: 'b'
line.value = 'new value';
console.log(line.text); // output: a=new value ; comment
```

### `comment`

Getter/setter for line comment.  Set to an empty string to remove a comment from a line.

**examples:**  
```javascript
const line = new IniLine('a=b ; comment')
console.log(line.comment); // output: 'comment'
line.comment = 'new comment';
console.log(line.text); // output: a=b ; new comment
```

### `text`

Getter/setter for line text.

**examples:**  
```javascript
const line = new IniLine('a=b ; comment')
console.log(line.text); // output: 'a=b ; comment'
line.text = 'new=text ; here';
```

## lineTypes
Enumeration of line types used by the IniLine class.

**properties:**

* blank: 0  
* comment: 1
* header: 2
* pair: 3
