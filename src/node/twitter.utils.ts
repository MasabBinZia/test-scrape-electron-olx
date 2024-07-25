import { BrowserWindow, session } from "electron";

import { localStore } from "./store";

const TWITTER_URL = "https://x.com";
const LOGIN_CHECK_INTERVAL = 1500;

export async function createTwitterLoginWindow() {
  return new Promise((resolve, reject) => {
    try {
      const authWindow = new BrowserWindow({
        height: 1024,
        width: 768,
        resizable: false,
      });

      let loginSuccess = false;

      void authWindow.loadURL(`${TWITTER_URL}/home`);

      authWindow.webContents.on("did-finish-load", () => {
        setTimeout(() => {
          checkIfError(authWindow)
            .then((error) => {
              if (error) {
                authWindow
                  .loadURL(TWITTER_URL)
                  .then(() => {
                    authWindow.reload();
                  })
                  .catch(() => {});
              }
            })
            .catch((e) => {
              console.log("error", e);
            });
        }, 1500);
      });

      const interval = setInterval(() => {
        (async () => {
          const loggedIn = await isTwitterLoggedIn();
          if (loggedIn) {
            loginSuccess = true;
            const userName = await captureLoggedInUsername(authWindow);
            setTwitterUsername(userName);
            authWindow.close();
          }
        })();
      }, LOGIN_CHECK_INTERVAL);

      authWindow.on("close", () => {
        resolve(loginSuccess);
        clearInterval(interval);
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function captureLoggedInUsername(window: BrowserWindow) {
  try {
    return window.webContents.executeJavaScript(
      `element = document.querySelector('[data-testid=AppTabBar_Profile_Link]');
		         element.href.split('.com/')[1];`,
      true
    ) as Promise<string>;
  } catch (e) {
    console.log("could not get username", e);
    return "";
  }
}

async function checkIfError(window: BrowserWindow) {
  try {
    return window.webContents.executeJavaScript(
      `cookieClearLoginError = false;
			for (const a of document.querySelectorAll("span")) {
    if (a.textContent.includes("Something went wrong. Try reloading.")) {
      cookieClearLoginError = true
    }
  }
  cookieClearLoginError;
  `,
      true
    ) as Promise<boolean>;
  } catch (e) {
    return false;
  }
}

export function getTwitterUsername() {
  // @ts-expect-error false alarm
  return localStore.get("USERNAME_KEY") || "user";
}

export function setTwitterUsername(username: string) {
  // @ts-expect-error false alarm

  localStore.set("USERNAME_KEY", username);
}

export async function isTwitterLoggedIn() {
  try {
    const cookies = await session.defaultSession.cookies.get({
      url: TWITTER_URL,
    });

    const authCookie = cookies.find((cookie) => cookie.name === "auth_token");

    return !!authCookie;
  } catch (e) {
    return false;
  }
}

export async function logoutTwitter() {
  const cookies = await session.defaultSession.cookies.get({
    url: TWITTER_URL,
  });

  for (const cookie of cookies) {
    await session.defaultSession.cookies.remove(TWITTER_URL, cookie.name);
  }

  // @ts-expect-error false alarm
  localStore.delete(USERNAME_KEY);
}
