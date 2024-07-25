import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('methods', {
	telegramLogin: () => ipcRenderer.invoke('telegram-login'),
	getToken: () => ipcRenderer.invoke('get-token'),
	setToken: (token: string) => ipcRenderer.send('set-token', token),
	openTwitterAuth: () => ipcRenderer.invoke('open-twitter-auth'),
	isTwitterLoggedIn: () => ipcRenderer.invoke('is-twitter-logged-in'),
	telegramLogout: () => ipcRenderer.invoke('telegram-logout'),
	logoutTwitter: () => ipcRenderer.invoke('logout-twitter'),
	getTwitterUsername: () => ipcRenderer.invoke('get-twitter-username'),
	copyToClipboard: (text: string) => ipcRenderer.send('copy-to-clipboard', text),
	
});

contextBridge.exposeInMainWorld('electron', {
	ipcRenderer: {
	  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
	},
  });