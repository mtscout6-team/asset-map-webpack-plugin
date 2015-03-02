var chai = require('chai');
chai.should();
global.expect = chai.expect;

require('./basic');
require('./relativeTo');
require('./extract-text-plugin');
