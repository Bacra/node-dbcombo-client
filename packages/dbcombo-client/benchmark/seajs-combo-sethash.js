'use strict';

module.exports = function(needComboUris)
{
  return paths2hash(uris2paths(needComboUris));
}

var comboHash = {};
var comboSyntax = ["??", ","];
var comboMaxLength = 2000;
var comboSuffix;


// Helpers

function uris2paths(uris) {
  return meta2paths(uris2meta(uris))
}

// [
//   "http://example.com/p/a.js",
//   "https://example2.com/b.js",
//   "http://example.com/p/c/d.js",
//   "http://example.com/p/c/e.js"
// ]
// ==>
// {
//   "http__example.com": {
//                          "p": {
//                                 "a.js": { __KEYS: [] },
//                                 "c": {
//                                        "d.js": { __KEYS: [] },
//                                        "e.js": { __KEYS: [] },
//                                        __KEYS: ["d.js", "e.js"]
//                                 },
//                                 __KEYS: ["a.js", "c"]
//                               },
//                          __KEYS: ["p"]
//                        },
//   "https__example2.com": {
//                            "b.js": { __KEYS: [] },
//                            _KEYS: ["b.js"]
//                          },
//   __KEYS: ["http__example.com", "https__example2.com"]
// }

function uris2meta(uris) {
  var meta = {
    __KEYS: []
  }

  for (var i = 0, len = uris.length; i < len; i++) {
    var parts = uris[i].replace("://", "__").split("/")
    var m = meta

    for (var j = 0, l = parts.length; j < l; j++) {
      var part = parts[j]

      if (!m[part]) {
        m[part] = {
          __KEYS: []
        }
        m.__KEYS.push(part)
      }
      m = m[part]
    }
  }

  return meta
}

// {
//   "http__example.com": {
//                          "p": {
//                                 "a.js": { __KEYS: [] },
//                                 "c": {
//                                        "d.js": { __KEYS: [] },
//                                        "e.js": { __KEYS: [] },
//                                        __KEYS: ["d.js", "e.js"]
//                                 },
//                                 __KEYS: ["a.js", "c"]
//                               },
//                          __KEYS: ["p"]
//                        },
//   "https__example2.com": {
//                            "b.js": { __KEYS: [] },
//                            _KEYS: ["b.js"]
//                          },
//   __KEYS: ["http__example.com", "https__example2.com"]
// }
// ==>
// [
//   ["http://example.com/p", ["a.js", "c/d.js", "c/e.js"]]
// ]

function meta2paths(meta) {
  var paths = []
  var __KEYS = meta.__KEYS

  for (var i = 0, len = __KEYS.length; i < len; i++) {
    var part = __KEYS[i]
    var root = part
    var m = meta[part]
    var KEYS = m.__KEYS

    while (KEYS.length === 1) {
      root += "/" + KEYS[0]
      m = m[KEYS[0]]
      KEYS = m.__KEYS
    }

    if (KEYS.length) {
      paths.push([root.replace("__", "://"), meta2arr(m)])
    }
  }

  return paths
}

// {
//   "a.js": { __KEYS: [] },
//   "c": {
//          "d.js": { __KEYS: [] },
//          "e.js": { __KEYS: [] },
//          __KEYS: ["d.js", "e.js"]
//        },
//   __KEYS: ["a.js", "c"]
// }
// ==>
// [
//   "a.js", "c/d.js", "c/e.js"
// ]

function meta2arr(meta) {
  var arr = []
  var __KEYS = meta.__KEYS

  for (var i = 0, len = __KEYS.length; i < len; i++) {
    var key = __KEYS[i]
    var r = meta2arr(meta[key])

    // key = "c"
    // r = ["d.js", "e.js"]
    var m = r.length
    if (m) {
      for (var j = 0; j < m; j++) {
        arr.push(key + "/" + r[j])
      }
    } else {
      arr.push(key)
    }
  }

  return arr
}

// [
//   [ "http://example.com/p", ["a.js", "c/d.js", "c/e.js", "a.css", "b.css"] ]
// ]
// ==>
//
// a hash cache
//
// "http://example.com/p/a.js"  ==> "http://example.com/p/??a.js,c/d.js,c/e.js"
// "http://example.com/p/c/d.js"  ==> "http://example.com/p/??a.js,c/d.js,c/e.js"
// "http://example.com/p/c/e.js"  ==> "http://example.com/p/??a.js,c/d.js,c/e.js"
// "http://example.com/p/a.css"  ==> "http://example.com/p/??a.css,b.css"
// "http://example.com/p/b.css"  ==> "http://example.com/p/??a.css,b.css"
//

function paths2hash(paths) {
  for (var i = 0, len = paths.length; i < len; i++) {
    var path = paths[i]
    var root = path[0] + "/"

    // 考虑到benchmark 注释掉分组逻辑
    // var group = files2group(path[1])

    // for (var j = 0, m = group.length; j < m; j++) {
    //   setHash(root, group[j])
    // }
    setHash(root, path[1]);
  }

  return comboHash
}

function setHash(root, files) {
  var copy = []
  for (var i = 0, len = files.length; i < len; i++) {
    copy[i] = files[i].replace(/\?.*$/, '')
  }
  var comboPath = root + comboSyntax[0] + copy.join(comboSyntax[1])
  if(comboSuffix) {
    comboPath += comboSuffix
  }
  var exceedMax = comboPath.length > comboMaxLength

  // http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url
  if (files.length > 1 && exceedMax) {
    var parts = splitFiles(files,
      comboMaxLength - (root + comboSyntax[0]).length)

    setHash(root, parts[0])
    setHash(root, parts[1])
  } else {
    if (exceedMax) {
      throw new Error("The combo url is too long: " + comboPath)
    }

    for (var i2 = 0, len2 = files.length; i2 < len2; i2++) {
      comboHash[root + files[i2]] = comboPath;
    }
  }
}

function splitFiles(files, filesMaxLength) {
  var sep = comboSyntax[1]
  var s = files[0]

  for (var i = 1, len = files.length; i < len; i++) {
    s += sep + files[i]
    if (s.length > filesMaxLength) {
      return [files.splice(0, i), files]
    }
  }
}

//
//  ["a.js", "c/d.js", "c/e.js", "a.css", "b.css", "z"]
// ==>
//  [ ["a.js", "c/d.js", "c/e.js"], ["a.css", "b.css"] ]
//

// function files2group(files) {
//   var group = []
//   var hash = {}

//   for (var i = 0, len = files.length; i < len; i++) {
//     var file = files[i]
//     var ext = getExt(file)
//     if (ext) {
//       (hash[ext] || (hash[ext] = [])).push(file)
//     }
//   }

//   for (var k in hash) {
//     if (hash.hasOwnProperty(k)) {
//       group.push(hash[k])
//     }
//   }

//   return group
// }

// function getExt(file) {
//   var p = file.lastIndexOf(".")
//   return p >= 0 ? file.substring(p) : ""
// }
