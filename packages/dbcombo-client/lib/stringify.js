'use strict';

var DEF = require('./def.js');
var EACH_GROUP_FILE_NUM = DEF.EACH_GROUP_FILE_NUM;
var MAX_GROUP_URI = DEF.MAX_GROUP_URI;
var MAX_NOT_REPEAT_GROUP_MARK = 4;
var MIN_FULL_GROUP_KEY_LENGTH = DEF.MIN_FULL_GROUP_KEY_LENGTH;

// console.log('DEFIND,%d,%d,%d,%d', EACH_GROUP_FILE_NUM, MAX_GROUP_KEY_LENGTH, MAX_GROUP_URI, MAX_NOT_REPEAT_GROUP_MARK);

var OFFSET2INDEX = (function()
	{
		var i = EACH_GROUP_FILE_NUM;
		var arr = [];
		while(i--)
		{
			arr[i] = 1 << i;
		}

		return arr;
	})();


var MARK_Z_GROUPS = (function()
	{
		var arr = [];
		var str = '';
		for(var i = 1; i < MAX_NOT_REPEAT_GROUP_MARK; i++)
		{
			arr[i] = (str += 'Z');
		}

		return arr;
	})();


function indexs2groups(indexs, groups)
{
	groups || (groups = []);

	for(var i = indexs.length; i--;)
	{
		var index = indexs[i];
		var groupIndex = index/EACH_GROUP_FILE_NUM | 0;
		var lowOffset = index%EACH_GROUP_FILE_NUM;
		var indexVal = OFFSET2INDEX[lowOffset];

		// console.log('index:%d groupIndex:%d indexVal:%d lowOffset:%d file:%s', index, groupIndex, indexVal, lowOffset);
		groups[groupIndex] = (groups[groupIndex] || 0) | indexVal;
	}

	return groups;
}


// 生成urlkey，高位→低位
// 除了32位的字符，转换后有如下特殊字符
// Z  分组无任何数据，占位使用
// Y  分组转成字符串之后，长度不足MAX_GROUP_KEY_LENGTH，补位
// /  数据可能超过文件名长度限制，用来分割
// W...X  当有很多Z的时候，为了美化，进行repeat处理; ...表示重复的次数
function stringify(indexs)
{
	return groups2str(indexs2groups(indexs));
}


function groups2str(groups)
{
	var str = '';
	var continuousEmptyGroups = 0;

	function ZXHandler()
	{
		if (continuousEmptyGroups)
		{
			if (MARK_Z_GROUPS[continuousEmptyGroups])
				str += MARK_Z_GROUPS[continuousEmptyGroups];
			else
				str += 'W'+continuousEmptyGroups+'X';

			continuousEmptyGroups = 0;
		}
	}

	for(var i = groups.length, val; i--;)
	{
		if (groups[i])
		{
			ZXHandler();

			val = groups[i];
			if (val < MIN_FULL_GROUP_KEY_LENGTH)
				str += 'Y'+val.toString(32);
			else
				str += val.toString(32);
		}
		else
		{
			continuousEmptyGroups++;
		}

		if (i && !(i%MAX_GROUP_URI))
		{
			ZXHandler();
			str += '/';
		}
	}


	ZXHandler();
	// console.log('groups len:%d, %o, url:%s', groups.length, groups, str);

	return str;
}



function mergeGroups()
{
	var args = arguments;
	var argsLength = args.length;
	var newGroups = [];
	var maxLength = 0;

	// group的最大长度
	for(var i = argsLength, item; i--;)
	{
		item = args[i].length;
		if (item > maxLength) maxLength = item;
	}

	for(var index = 0; index < maxLength; index++)
	{
		var groupResult = 0;

		for(var i2 = argsLength, item2; i2--;)
		{
			item2 = args[i2][index];
			if (item2) groupResult |= item2;
		}

		newGroups[index] = groupResult;
	}

	return newGroups;
}


exports = module.exports = stringify;
exports.indexs2groups = indexs2groups;
exports.groups2str = groups2str;
exports.mergeGroups = mergeGroups;
