// Automatically patches Next.js recursive-delete to prevent EINVAL readlink errors on Windows OneDrive
const fs = require("fs");
const path = require("path");

const filesToPatch = [
  path.join(__dirname, "..", "node_modules", "next", "dist", "lib", "recursive-delete.js"),
  path.join(__dirname, "..", "node_modules", "next", "dist", "esm", "lib", "recursive-delete.js"),
];

for (const filePath of filesToPatch) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, "utf8");

  // CommonJS version
  if (content.includes("const linkPath = await _fs.promises.readlink(absolutePath);")) {
    content = content.replace(
      /const isSymlink = part\.isSymbolicLink\(\);\s*if \(isSymlink\) \{\s*const linkPath = await _fs\.promises\.readlink\(absolutePath\);\s*try \{\s*const stats = await _fs\.promises\.stat\(\(0, _path\.isAbsolute\)\(linkPath\) \? linkPath : \(0, _path\.join\)\(\(0, _path\.dirname\)\(absolutePath\), linkPath\)\);\s*isDirectory = stats\.isDirectory\(\);\s*\} catch\s*\{\}\s*\}/,
      `let isSymlink = part.isSymbolicLink();
        if (isSymlink) {
            try {
                const linkPath = await _fs.promises.readlink(absolutePath);
                try {
                    const stats = await _fs.promises.stat((0, _path.isAbsolute)(linkPath) ? linkPath : (0, _path.join)((0, _path.dirname)(absolutePath), linkPath));
                    isDirectory = stats.isDirectory();
                } catch  {}
            } catch {
                isSymlink = false;
            }
        }`
    );
    fs.writeFileSync(filePath, content, "utf8");
  }

  // ESM version
  if (content.includes("const linkPath = await promises.readlink(absolutePath);")) {
    content = content.replace(
      /const isSymlink = part\.isSymbolicLink\(\);\s*if \(isSymlink\) \{\s*const linkPath = await promises\.readlink\(absolutePath\);\s*try \{\s*const stats = await promises\.stat\(isAbsolute\(linkPath\) \? linkPath : join\(dirname\(absolutePath\), linkPath\)\);\s*isDirectory = stats\.isDirectory\(\);\s*\} catch\s*\{\}\s*\}/,
      `let isSymlink = part.isSymbolicLink();
        if (isSymlink) {
            try {
                const linkPath = await promises.readlink(absolutePath);
                try {
                    const stats = await promises.stat(isAbsolute(linkPath) ? linkPath : join(dirname(absolutePath), linkPath));
                    isDirectory = stats.isDirectory();
                } catch  {}
            } catch {
                isSymlink = false;
            }
        }`
    );
    fs.writeFileSync(filePath, content, "utf8");
  }
}
