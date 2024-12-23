---

## Instagram Downloader

A full-stack Node/Express + React application for downloading Instagram posts and Reels **without** using the official Instagram API. This tool scrapes publicly available metadata (via HTML) to retrieve the direct URL of images or videos.

**Disclaimer**: This project is for educational/personal use only. Instagram may change its HTML structure or impose new security measures at any time, which could break this approach. Always comply with local laws and Instagram's Terms of Service.

---

## Features

- **Frontend**: A simple, modern, and responsive React interface.
- **Backend**: An Express server that uses `axios` and `cheerio` to scrape HTML.
- **No Official API**: Uses publicly accessible metadata, not the Instagram API.
- **Instant Download Links**: Provides direct links to images or videos (if available).

---

## How It Works

1. The user pastes an Instagram post or Reel URL into the input field.
2. The server scrapes the HTML page at that URL.
3. It looks for `og:video` and `og:image` meta tags.
4. If found, the app displays direct links to the media.

---

## Project Structure

```
instagram-downloader/
├─ server.js              # Main Express server file
├─ package.json           # Server-side dependencies and scripts
├─ client/
│  ├─ package.json        # React dependencies and scripts
│  ├─ public/
│  │  └─ index.html       # Main React index file
│  └─ src/
│      ├─ App.js          # Main React component
│      ├─ App.css         # App-level CSS styling
│      ├─ index.js        # React entry point
│      └─ ...
└─ ...
```

---

## Getting Started (Local Development)

1. **Clone** your GitHub repository:
   ```bash
   git clone https://github.com/yourusername/instagram-downloader.git
   cd instagram-downloader
   ```

2. **Install server dependencies**:
   ```bash
   npm install
   ```

3. **Install client dependencies**:
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Run in development mode**:
   ```bash
   npm run dev
   ```
   - This will start:
     - The Express server on **port 5000**.
     - The React development server on **port 3000**.
   - Open your browser at [http://localhost:3000](http://localhost:3000) to see the React app.

5. **Build & run in production mode**:
   ```bash
   cd client
   npm run build
   cd ..
   npm start
   ```
   - This will create a production build of the React app in `client/build`.
   - Your app will be served on **port 5000** (or the port specified by `process.env.PORT`).

---

## Deploying to Render

1. **Push** your code to a public or private GitHub repository.
2. **Create** a new [Render](https://render.com/) web service. Connect it to your GitHub repo.
3. **Build Command** (under “Build & Deploy” settings on Render):
   ```bash
   npm install && npm install --prefix client && npm run build --prefix client
   ```
4. **Start Command**:
   ```bash
   npm start
   ```
5. Ensure **Environment** variable `NODE_ENV` is set to `production` (Render often does this by default).

Render will:
- Install root dependencies and client dependencies.
- Build the React app in `client/build`.
- Start the Express server to serve production files.

---

## Usage

1. **Open** the website (either locally or from your deployed Render URL).
2. **Paste** the Instagram **post** or **Reel** URL into the input field. 
   - Example: `https://www.instagram.com/p/xxxxxx/`
3. **Click** "Download".
4. If successful, the app will show **direct links** for:
   - Video: `og:video`
   - Image: `og:image`
5. **Right-click** and “Save video as…” or “Save image as…” in your browser to download.

---

## Troubleshooting

- **“No media found” Error**: The link might be invalid, private, or Instagram changed its structure.
- **CORS / Request Blocked**: The app sets a custom `User-Agent`, but if Instagram changes blocking policies, requests may fail.
- **Deployment Issues**: Double-check the environment variables and that your **Build Command** and **Start Command** are set correctly on Render.

---

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/my-feature`.
3. Make your changes and commit: `git commit -m "Add some feature"`.
4. Push to your fork: `git push origin feature/my-feature`.
5. Create a Pull Request in this repository.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

> **Important**: This code is provided **as-is** without any guarantees. Scraping websites may violate their terms of service. Use at your own risk.
