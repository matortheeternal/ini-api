import iniTests from '../common/ini.test.js';
import iniLineTests from '../common/iniLine.test.js';
import iniSectionTests from '../common/iniSection.test.js';
import mergeTests from '../common/merge.test.js';
import * as lib from '../../dist/index.mjs';

iniTests(lib);
iniLineTests(lib);
iniSectionTests(lib);
mergeTests(lib);
