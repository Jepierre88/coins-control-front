export type ScienerErrorResponse = {
  errcode?: number
  errmsg?: string
}

export type AddCustomPassCodeResponse = ScienerErrorResponse & {
  keyboardPwdId?: number
  keyboardPwd?: string
}

export type DeletePasscodeResponse = ScienerErrorResponse & {
  description?: string
}

export type UnlockResponse = ScienerErrorResponse & {
  description?: string
}

export type AddCustomPassCodeArgs = {
  clientId: string | number
  accessToken: string
  lockId: string | number
  keyboardPwdName: string
  startDate: string | number | Date
  endDate: string | number | Date
  keyboardPwd: string
}

export type DeletePasscodeArgs = {
  clientId: string | number
  accessToken: string
  lockId: string | number
  keyboardPwdId: string | number
}

export type UnlockArgs = {
  clientId: string | number
  accessToken: string
  lockId: string | number
}
