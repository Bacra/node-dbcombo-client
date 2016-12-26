var expect = require('expect.js');
var loadUtils = require('./seajs-load-utils');
var Promise = require('bluebird');

describe('#seajs-plugin', function()
{
	describe('#single', function()
	{
		var suite = this;
		before(function()
		{
			loadUtils.initAndClearSeajsModuleCache(suite.title);
		});

		it('#first', function()
		{
			return loadUtils.assertSeajsUse('a0.js', function(obj)
				{
					expect(obj).to.be.eql({a0: true});
				});
		});

		it('#cache', function()
		{
			return loadUtils.assertSeajsUse('a0.js', function(obj)
				{
					expect(obj).to.be.eql({a0: true});
				});
		});
	});


	describe('#deps', function()
	{
		var suite = this;
		before(function()
		{
			loadUtils.initAndClearSeajsModuleCache(suite.title);
		});

		it('#first', function()
		{
			return loadUtils.assertSeajsUse('a1.js', function(obj)
				{
					expect(obj).to.be.eql({a1: true});
				});
		});

		it('#depart', function()
		{
			return loadUtils.assertSeajsUse('a0.js', function(obj)
				{
					expect(obj).to.be.eql({a0: true});
				});
		});

		it('#cache', function()
		{
			return loadUtils.assertSeajsUse('a2.js', function(obj)
				{
					expect(obj).to.be.eql({a2: true});
				});
		});

		it('#cache outside', function()
		{
			return loadUtils.assertSeajsUse(['a2.js', 'outside.js'], function(obj, obj2)
				{
					expect(obj).to.be.eql({a2: true});
					expect(obj2).to.be.eql({outside: true});
				});
		});

		it('#nocache outside', function()
		{
			loadUtils.initAndClearSeajsModuleCache(suite.title, this.test.title);
			return loadUtils.assertSeajsUse(['a1.js', 'outside.js'], function(obj, obj2)
				{
					expect(obj).to.be.eql({a1: true});
					expect(obj2).to.be.eql({outside: true});
				});
		});
	});


	describe('#delay', function()
	{
		var suite = this;
		before(function()
		{
			loadUtils.initAndClearSeajsModuleCache(suite.title);
		});

		it('#first', function()
		{
			return Promise.all(
			[
				loadUtils.assertSeajsUse('a11.js', function(obj)
				{
					expect(obj).to.be.eql({a11: true});
				}),
				loadUtils.assertSeajsUse('a12.js', function(obj)
				{
					expect(obj).to.be.eql({a12: true});
				}),
				loadUtils.assertSeajsUse('a13.js', function(obj)
				{
					expect(obj).to.be.eql({a13: true});
				})
			]);
		});

		it('#cache', function()
		{
			return Promise.all(
			[
				loadUtils.assertSeajsUse('a11.js', function(obj)
				{
					expect(obj).to.be.eql({a11: true});
				}),
				loadUtils.assertSeajsUse('a12.js', function(obj)
				{
					expect(obj).to.be.eql({a12: true});
				}),
				loadUtils.assertSeajsUse('a13.js', function(obj)
				{
					expect(obj).to.be.eql({a13: true});
				})
			]);
		});

		it('#depart', function()
		{
			return loadUtils.assertSeajsUse('a11.js', function(obj)
			{
				expect(obj).to.be.eql({a11: true});
			});
		});

		it('#depart2', function()
		{
			return loadUtils.assertSeajsUse(['a11.js', 'a12.js'], function(obj)
			{
				expect(obj).to.be.eql({a11: true});
			});
		});

		it('#cache outside', function()
		{
			return loadUtils.assertSeajsUse(['a11.js', 'outside.js'], function(obj, obj2)
			{
				expect(obj).to.be.eql({a11: true});
				expect(obj2).to.be.eql({outside: true});
			});
		});

		it('#nocache outside', function()
		{
			loadUtils.initAndClearSeajsModuleCache(suite.title, this.test.title);

			return Promise.all(
			[
				loadUtils.assertSeajsUse(['a11.js', 'a12.js'], function(obj)
				{
					expect(obj).to.be.eql({a11: true});
				}),
				loadUtils.assertSeajsUse('a13.js', function(obj)
				{
					expect(obj).to.be.eql({a13: true});
				}),
				loadUtils.assertSeajsUse('outside.js', function(obj)
				{
					expect(obj).to.be.eql({outside: true});
				})
			]);
		});
	});
});
