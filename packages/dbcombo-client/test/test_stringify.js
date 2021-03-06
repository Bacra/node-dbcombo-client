'use strict';

var expect		= require('expect.js');
var stringify	= require('../').stringify;
var DEF			= require('../lib/def');

describe('#stringify', function()
{
	it('#base', function()
	{
		var vals = ["Y1", "Y2", "Y4", "Y8", "Yg", "Y10", "Y20", "Y40", "Y80", "Yg0", "Y100", "Y200", "Y400", "Y800", "Yg00", "Y1000", "Y2000", "Y4000", "Y8000", "Yg000", "Y10000", "Y20000", "Y40000", "Y80000", "Yg0000", "Y100000", "Y200000", "Y400000", "Y800000", "Yg00000", "1000000", "Y1Z", "Y2Z"];

		for(var i = DEF.EACH_GROUP_FILE_NUM + 2; i--;)
		{
			expect(stringify([i])).to.be(vals[i]);
		}

		expect(stringify([0,1])).to.be('Y3');
		expect(stringify([0, 30])).to.be('1000001');
		expect(stringify([31, 30])).to.be('Y11000000');
		expect(stringify([0, 31])).to.be('Y1Y1');
		expect(stringify([0, 31, 31])).to.be('Y1Y1');
		expect(stringify([0, 31, 92, 93, 94])).to.be('Y31000000Y1Y1');
		expect(stringify([0, 93, 92, 31, 94])).to.be('Y31000000Y1Y1');
		expect(stringify([1000])).to.be('Y80W32X');
		expect(stringify([2000])).to.be('Y2000W29X/W35X');
		expect(stringify([5000])).to.be('Yg0W21X/W35X/W35X/W35X/W35X');
		expect(stringify([4000, 34])).to.be('Y2W24X/W35X/W35X/W33XY8Z');
	});


	it('#long', function()
	{
		var i = DEF.MAX_GROUP_URI * 3;
		var arr = [];
		while(i--)
		{
			arr.push(i * DEF.EACH_GROUP_FILE_NUM);
		}

		var key = stringify(arr);
		expect(key).to.be('Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1/Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1/Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1');
	});


	it('#long2', function()
	{
		var i = DEF.MAX_GROUP_URI * 2;
		var arr = [];
		while(i--)
		{
			arr.push(i * DEF.EACH_GROUP_FILE_NUM+i);
		}

		var key = stringify(arr);

		expect(key).to.be('Y40Y20/Y10YgY8Y4Y2Y1Z1000000Yg00000Y800000Y400000Y200000Y100000Yg0000Y80000Y40000Y20000Y10000Yg000Y8000Y4000Y2000Y1000Yg00Y800Y400Y200Y100Yg0Y80Y40Y20Y10YgY8/Y4Y2Y1Z1000000Yg00000Y800000Y400000Y200000Y100000Yg0000Y80000Y40000Y20000Y10000Yg000Y8000Y4000Y2000Y1000Yg00Y800Y400Y200Y100Yg0Y80Y40Y20Y10YgY8Y4Y2Y1');
	});

	it('#indexs2groups', function()
	{
		/* eslint no-sparse-arrays: off */
		expect(stringify.indexs2groups([0])).to.eql([1]);
		expect(stringify.indexs2groups([0, 3, 93, 94])).to.eql([9, , , 3]);
	});

	it('#mergeGroups', function()
	{
		/* eslint no-sparse-arrays: off */
		expect(stringify.mergeGroups([])).to.eql([]);
		expect(stringify.mergeGroups()).to.eql([]);
		expect(stringify.mergeGroups([1])).to.eql([1]);
		expect(stringify.mergeGroups([1, 3], [3, , 8])).to.eql([3, 3, 8]);
		expect(stringify.mergeGroups([1, 3], [3, , 8], [4])).to.eql([7, 3, 8]);
	});
});
