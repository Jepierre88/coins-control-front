"use server"

import {
  type AddCustomPassCodeArgs,
  type AddCustomPassCodeResponse,
  type DeletePasscodeArgs,
  type DeletePasscodeResponse,
  type UnlockArgs,
  type UnlockResponse,
} from "@/types/sciener/sciener.entity"
import { getScienerApiBaseUrl } from "@/lib/sciener/sciener-utils"

async function postForm<T>(path: string, form: Record<string, string | number | undefined | null>) {
  const body = new URLSearchParams()
  for (const [k, v] of Object.entries(form)) {
    if (v === undefined || v === null) continue
    body.append(k, String(v))
  }

  const res = await fetch(`${getScienerApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    // Sciener is a third-party API; avoid caching.
    cache: "no-store",
  })

  const json = (await res.json()) as T
  return json
}

export async function addCustomPassCode(args: AddCustomPassCodeArgs): Promise<AddCustomPassCodeResponse> {
  const startMs = typeof args.startDate === "number" ? args.startDate : new Date(args.startDate).getTime()
  const endMs = typeof args.endDate === "number" ? args.endDate : new Date(args.endDate).getTime()

  return postForm<AddCustomPassCodeResponse>("/v3/keyboardPwd/add", {
    clientId: args.clientId,
    accessToken: args.accessToken,
    lockId: args.lockId,
    keyboardPwd: args.keyboardPwd,
    keyboardPwdName: args.keyboardPwdName,
    keyboardPwdType: "",
    startDate: startMs,
    endDate: endMs,
    addType: 2,
    date: Date.now(),
  })
}

export async function deletePasscode(args: DeletePasscodeArgs): Promise<DeletePasscodeResponse> {
  return postForm<DeletePasscodeResponse>("/v3/keyboardPwd/delete", {
    clientId: args.clientId,
    accessToken: args.accessToken,
    lockId: args.lockId,
    keyboardPwdId: args.keyboardPwdId,
    deleteType: 2,
    date: Date.now(),
  })
}

export async function unlock(args: UnlockArgs): Promise<UnlockResponse> {
  return postForm<UnlockResponse>("/v3/lock/unlock", {
    clientId: args.clientId,
    accessToken: args.accessToken,
    lockId: args.lockId,
    date: Date.now(),
  })
}
