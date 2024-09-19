import { AccountInfo, PublicClientApplication } from "@azure/msal-browser";
import axios, { AxiosRequestConfig } from "axios";

export async function getFunctionToken(account: AccountInfo, noRetry?: boolean): Promise<string> {
	if (!account) {
		throw new Error("Account is required for acquiring function token");
	}

	const response = await axios.post(process.env.TOKEN_PROVIDER_URL + "/.auth/login/aad", {
		access_token: account.idToken,
	});

	if (response.status === 401 && !noRetry) {
		// refresh token and retry
		axios.get(process.env.TOKEN_PROVIDER_URL + "/.auth/refresh");
		getFunctionToken(account, true);
	}

	if (response.status !== 200) {
		throw new Error("Failed to get function token");
	}
	return response.data.authenticationToken;
}

// Helper function to authenticate the user
export async function getMsalInstance(): Promise<PublicClientApplication> {
	// Get the client id (app id) from the environment variables
	const clientId = process.env.CLIENT_ID;

	if (!clientId) {
		throw new Error("CLIENT_ID is not defined");
	}

	// Create the MSAL instance
	const msalConfig = {
		auth: {
			clientId,
			authority: "https://login.microsoftonline.com/" + process.env.TENANT_ID,
			tenantId: process.env.TENANT_ID,
		},
	};

	// Initialize the MSAL instance
	const msalInstance = new PublicClientApplication(msalConfig);
	await msalInstance.initialize();

	return msalInstance;
}

// Call axios to get a token from the token provider
export async function getAccessToken(
	url: string,
	noRetry?: boolean,
	config?: AxiosRequestConfig,
): Promise<string> {
	const response = await axios.get(url, config);

	if (response.status === 401 && !noRetry) {
		// refresh token and retry
		axios.get(process.env.TOKEN_PROVIDER_URL + "/.auth/refresh");
		getAccessToken(url, true, config);
	}

	if (response.status !== 200) {
		throw new Error("Failed to get access token");
	}

	return response.data as string;
}
