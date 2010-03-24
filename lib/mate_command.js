// ==========================================================================
// Project:   Mate - TextMate Utilities
// Copyright: ©2010 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see __preamble__.js)
// ==========================================================================


var seed = require.seed,
    Cs   = require('core_support');

exports.usage = 'mate PACKAGE..PACKAGEn';
exports.summary = "Open the named package or path in TextMate";
exports.options = [
  ['-V', '--version VERSION', 'Optional package version']
];
  
exports.desc = [
'Opens the named package or path in TextMate. You must have the "mate"',
'command installed in your path.'].join('');

exports.invoke = function(cmd, args, opts, done) {
  var version = null,
      err, packageIds;
      
  opts.on('version', function(k,v) { version = v; });
  packageIds = opts.parse(args);

  // basic argument checks
  if (packageIds.length <= 0) {
    err = new Error("You must pass at least one packageId");
    return done(err);
  }
  
  if (version && (packageIds.length !== 1)) {
    err = new Error("You can only pass one package with a version");
    return done(err);
  }
  
  Cs.map(packageIds, function(packageId, done) {
    if ((packageId.indexOf('.')>=0) || (packageId.indexOf('/')>=0)) {
      var path = Cs.path.normalize(packageId);
      seed.openNearestPackage(path, function(err, pkg) {
        if (!err && !pkg) err = new Error(packageId + ' is not a package');
        if (err) return done(err);
        return done(null, pkg.path);
      });
    } else {
      seed.openPackage(packageId, version, null, function(err, pkg) {
        if (!err && !pkg) err = new Error(packageId + ' not found');
        if (err) return done(err);
        return done(null, pkg.path);
      });
    }
  })(function(err, paths) {
    if (err) return done(err);
    Cs.fs.exec('mate '+paths.join(' '));
  });
};

