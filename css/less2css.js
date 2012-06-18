//less css Compiler for node 
var lessCompiler = require('less-compiler');
var lessPath = '/home/lai/workspace/ihaveu/css';
var cssPath = '/home/lai/workspace/ihaveu/css';
var path= require('path');

// set up the compiler
var compiler = lessCompiler({
  src: path.join(lessPath, 'style.less'), // the less file with all your imports
  dest: cssPath                           // the directory where all your compiled CSS files go
});
compiler.on('compile', function() {
  console.log("recompiled LESS assets");
});
compiler.on('error', function(err) {
  console.log("could not compile LESS assets: ");
  console.log(err);
});

// watch the parent directory of the src file
compiler.watch(); 
