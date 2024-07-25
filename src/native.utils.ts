export async function initiateTwitterAuth() {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	return (await (window as any).methods.openTwitterAuth()) as boolean;
}

export async function logoutTwitter() {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	await (window as any).methods.logoutTwitter();
}

export async function getTwitterUsername() {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	return (await (window as any).methods.getTwitterUsername()) as string;
}
