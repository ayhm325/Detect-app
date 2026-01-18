const fs = require("fs");
const p = JSON.parse(fs.readFileSync("package.json"));
if (p.scripts) {
  delete p.scripts["dev:model"];
  delete p.scripts["check:model"];
  if (p.scripts.dev)
    p.scripts.dev = p.scripts.dev.replace(' "npm run dev:model"', "");
  if (p.scripts["dev:with-socket"])
    p.scripts["dev:with-socket"] = p.scripts["dev:with-socket"].replace(
      ' "npm run dev:model"',
      "",
    );
  if (p.scripts["test:e2e"])
    p.scripts["test:e2e"] = p.scripts["test:e2e"].replace(
      "npm run check:model && ",
      "",
    );
  if (p.scripts["test:e2e:watch"])
    p.scripts["test:e2e:watch"] = p.scripts["test:e2e:watch"].replace(
      "npm run check:model && ",
      "",
    );
  fs.writeFileSync("package.json", JSON.stringify(p, null, 2) + "\n");
  console.log("package.json updated");
} else {
  console.log("no scripts");
}
