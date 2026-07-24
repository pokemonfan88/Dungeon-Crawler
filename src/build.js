// build.js — 将 src/ 多文件打包成单文件 烛照幽渊.html
const fs = require('fs');

// 读取 HTML 骨架
let html = fs.readFileSync('src/index.html', 'utf8');

// 按顺序读取 JS 模块
const modules = ['data','core','expedition','camp','race','main'];
let js = '';
for (const mod of modules) {
  const file = `src/js/${mod}.js`;
  if (fs.existsSync(file)) {
    js += fs.readFileSync(file, 'utf8').trim() + '\n';
    console.log(`  ✅ ${mod}.js`);
  } else {
    console.log(`  ⚠️  ${mod}.js not found`);
  }
}

// 替换 script 引用为内联
html = html.replace(/<script src="js\/[^"]*"><\/script>\n?/g, '');
html = html.replace('</body>', '<script>\n' + js + '\n</script>\n</body>');

// 写入输出
fs.writeFileSync('烛照幽渊.html', html);
const size = Math.round(html.length / 1024);
console.log(`\n✅ 烛照幽渊.html built — ${size} KB`);
