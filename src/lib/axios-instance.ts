import axios, { type AxiosInstance } from "axios"

import { authClient } from "@/lib/auth-client"
import { ENVIRONTMENT } from "@/lib/environment"

type BetterAuthSessionShape = {
	session?: { externalToken?: string | null } | null
}

async function getExternalTokenFromSession(): Promise<string | undefined> {
	if (typeof window === "undefined") return undefined

	try {
		// better-auth/react usually exposes getSession() on the client.
		const session = (await (authClient as unknown as { getSession?: () => Promise<unknown> }).getSession?.()) as
			| BetterAuthSessionShape
			| undefined

		const token = session?.session?.externalToken
		return typeof token === "string" && token.length > 0 ? token : undefined
	} catch {
		return undefined
	}
}

/**
 * Factory for cases where you already have the externalToken (e.g. server-side).
 */
export function createMainApi(args?: { externalToken?: string; baseURL?: string }): AxiosInstance {
	const api = axios.create({
		baseURL: args?.baseURL ?? ENVIRONTMENT.BACKEND_URL,
	})

	api.interceptors.request.use((config) => {
		const token = args?.externalToken
		if (!token) return config

		config.headers = config.headers ?? {}
		config.headers.Authorization = `Bearer ${token}`
		return config
	})

	return api
}

/**
 * Default instance: automatically injects the external token from Better Auth session (client-side).
 */
export const mainApi = (() => {
	const api = axios.create({
		baseURL: ENVIRONTMENT.BACKEND_URL,
	})

	api.interceptors.request.use(async (config) => {
		const token = await getExternalTokenFromSession()
		if (!token) return config

		config.headers = config.headers ?? {}
		config.headers.Authorization = `Bearer ${token}`
		return config
	})

	return api
})()

export default mainApi
