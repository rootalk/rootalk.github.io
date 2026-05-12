const fs = require("fs");
const YAML = require("yaml");

// 添加导航栏链接(到light主题配置文件中)
function addPageToMenu() {
  const PAGES = {
    archives: "归档", // 路径 : 显示名
  };
  const themeConfigFile = "themes/minos/_config.yml";

  try {
    const doc = YAML.parse(fs.readFileSync(themeConfigFile, "utf8"));

    // menus
    doc.menu = {};
    Object.keys(PAGES).forEach((key) => {
      doc.menu[PAGES[key]] = key;
    });

    doc.article.readtime = false;
    doc.article.date_format = "relative_full";

    // google-analytics
    doc.plugins["google-analytics"].tracking_id = "G-4TMNJTXQ4V";
    // google-adsense
    doc.plugins["google-adsense"].client_id = "ca-pub-2856623751165786";

    // remove - to use config in root path
    delete doc.favicon;
    delete doc.logo;
    delete doc.share;
    delete doc.comment;

    const newYaml = YAML.stringify(doc, { nullStr: " " });
    console.log(newYaml);
    fs.writeFileSync(themeConfigFile, newYaml, "utf8");
  } catch (e) {
    console.log(e);
  }
}

addPageToMenu();
