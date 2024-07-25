import { app, BrowserWindow, ipcMain, session } from "electron";
import path from "path";
import https from "https";

import {
  createTwitterLoginWindow,
  getTwitterUsername,
  isTwitterLoggedIn,
  logoutTwitter,
} from "./node/twitter.utils";

function scrapeOLX(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    https
      .get("https://www.olx.com.pk/items/q-macbooks", (res: any) => {
        let data = "";
        res.on("data", (chunk: any) => {
          data += chunk;
        });
        res.on("end", () => {
          const products = [];
          const regex =
            /<li class="[^"]*" aria-label="Listing">([\s\S]*?)<\/li>/g;
          let match;
          while ((match = regex.exec(data)) !== null) {
            const itemHtml = match[1];
            const title =
              itemHtml.match(/<h2 class="[^"]*">(.*?)<\/h2>/)?.[1] || "";
            const price =
              itemHtml.match(/<span class="[^"]*">(Rs [0-9,]+)<\/span>/)?.[1] ||
              "";
            const location =
              itemHtml.match(
                /<span class="[^"]*" aria-label="Location">(.*?)<\/span>/
              )?.[1] || "";
            const creationDate =
              itemHtml.match(
                /<span aria-label="Creation date">(.*?)<\/span>/
              )?.[1] || "";
            products.push({ title, price, location, creationDate });
          }
          resolve(products);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
const RESET_APP_ON_STARTUP = false;
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    resizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, 
      webviewTag: true,
      contextIsolation: true, 
      nodeIntegration: false, 
      devTools: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url === "about:blank") {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          frame: true,
          fullscreenable: true,
          backgroundColor: "black",
          webPreferences: {
            preload: "my-child-window-preload-script.js",
          },
        },
      };
    }
    return { action: "allow" };
  });

  ipcMain.handle("open-twitter-auth", createTwitterLoginWindow);
  ipcMain.handle("is-twitter-logged-in", isTwitterLoggedIn);
  ipcMain.handle("get-twitter-username", getTwitterUsername);
  ipcMain.handle("logout-twitter", logoutTwitter);

  void mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  // mainWindow.webContents.openDevTools();
};

ipcMain.handle("scrape-olx", async () => {
  try {
    const products = await scrapeOLX();
    return products;
  } catch (error) {
    console.error("Scraping error:", error);
    return [];
  }
});

app.on("ready", () => {
  session.defaultSession.protocol.registerFileProtocol(
    "static",
    (request, callback) => {
      const fileUrl = request.url.replace("static://", "");
      const filePath = path.join(
        app.getAppPath(),
        ".webpack/renderer",
        fileUrl
      );
      callback(filePath);
    }
  );
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self' 'unsafe-eval' 'unsafe-inline' static: http: https: ws:; worker-src 'self' blob:;",
        ],
      },
    });
  });

  if (RESET_APP_ON_STARTUP) {
    logoutTwitter();
  }

  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});

app.setLoginItemSettings({
  openAtLogin: true,
});
