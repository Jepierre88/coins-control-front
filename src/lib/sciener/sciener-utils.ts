const DEFAULT_SCIENER_BASE_URL = "https://euapi.sciener.com"

export function getScienerApiBaseUrl() {
  return process.env.SCIENER_API_BASE_URL || DEFAULT_SCIENER_BASE_URL
}

export function generateKeyboardPwd(length = 6) {
  const characters = "0123456789"
  let code = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    code += characters.charAt(randomIndex)
  }
  return code
}
