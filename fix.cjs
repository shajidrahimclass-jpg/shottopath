const fs = require('fs');
let sql = fs.readFileSync('tasks/database_setup.sql', 'utf8');

// Find the CREATE TABLE app_downloads block
const tableRegex = /CREATE TABLE IF NOT EXISTS app_downloads \([\s\S]*?\);\n/m;
const match = sql.match(tableRegex);

if (match) {
  // Remove it from current position
  sql = sql.replace(match[0], '');
  
  // Insert it before app_download_analytics
  const targetRegex = /CREATE TABLE IF NOT EXISTS app_download_analytics/m;
  sql = sql.replace(targetRegex, match[0] + '\n\nCREATE TABLE IF NOT EXISTS app_download_analytics');
  
  fs.writeFileSync('tasks/database_setup.sql', sql);
  console.log("Fixed app_downloads order");
} else {
  console.log("Not found");
}
