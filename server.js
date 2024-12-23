{
  "name": "instagram-downloader",
  "version": "1.0.0",
  "description": "Instagram post/reels downloader without using official API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "server": "node server.js",
    "client": "npm start --prefix client",
    "dev": "concurrently \"npm run server\" \"npm run client\""
  },
  "keywords": [],
  "author": "Your Name",
  "license": "ISC",
  "dependencies": {
    "axios": "^1.5.0",
    "cheerio": "^1.0.0-rc.12",
    "concurrently": "^8.2.0",
    "express": "^4.18.2",
    "path": "^0.12.7"
  }
}