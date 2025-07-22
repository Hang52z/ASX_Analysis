// server.js
const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const csv     = require('csv-parser');

const app  = express();
const PORT = process.env.PORT || 3000;

// 如果需要前端从其他域名或端口 fetch，打开 CORS
app.use(cors());

// GET /announcements  → 返回 CSV 解析后的 JSON
app.get('/merged_announcements', (req, res) => {
  const results = [];
  // 假设你的 CSV 在项目根的 results/announcements.csv
  const csvPath = path.join(__dirname, 'results', 'merged_announcements.csv');

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', row => results.push(row))
    .on('end', () => res.json(results))
    .on('error', err => {
      console.error('读取 CSV 出错:', err);
      res.status(500).json({ error: '无法读取 merged_announcements.csv' });
    });
});

// （可选）如果还想保留静态下载 CSV/HTML 的能力：
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`🚀 服务启动并监听 0.0.0.0:${PORT}`);
});
