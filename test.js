const { relative } = require('path');

console.log(relative('', 'app/sub/dir'));
console.log(relative('app', 'app/sub/dir'));
console.log(relative('/app', 'app/sub/dir'));
console.log(relative('app/other', 'app/sub/dir'));
console.log(relative('/app/other', 'app/sub/dir'));
console.log(relative('app/sub/dir', 'app/other'));
console.log(relative('app/sub/dir', 'app'));
console.log(relative('app/sub/dir', ''));

// function toRelativePath(path: string): string {
//   if (path.startsWith('.')) {
//     return path;
//   }

//   return `./${path}`;
// }
