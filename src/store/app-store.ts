import { create, SetState } from 'zustand';
import { StateCreator } from 'zustand/vanilla';

export interface AppStore {
	twitterLoggedIn: boolean;
	setTwitterLoggedIn: (loggedIn: boolean) => void;
}

export const appStoreStateCreator: StateCreator<AppStore> = (
	set: SetState<AppStore>,
) => ({
	twitterLoggedIn: false,
	setTwitterLoggedIn: (twitterLoggedIn: boolean) => {
		set({ twitterLoggedIn });
	},
});

export const useAppStore = create(appStoreStateCreator);

export const useTwitterLoggedIn = () => useAppStore((s) => s.twitterLoggedIn);
export const useSetTwitterLoggedIn = () => useAppStore((s) => s.setTwitterLoggedIn);
