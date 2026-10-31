import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"
import { createClient } from "@supabase/supabase-js"

const PROVIDERS = {
  openrouter: {
    label: "OpenRouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: "openai/gpt-4.1-mini",
  },
  openai: {
    label: "OpenAI",
    endpoint: "https://api.openai.com/v1/chat/completions",
    defaultModel: "gpt-4.1-mini",
  },
  groq: {
    label: "Groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: "llama-3.3-70b-versatile",
  },
  together: {
    label: "Together AI",
    endpoint: "https://api.together.xyz/v1/chat/completions",
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  },
}

export const AI_PROVIDER_OPTIONS = Object.entries(PROVIDERS).map(([id, value]) => ({
  id,
  label: value.label,
  defaultModel: value.defaultModel,
}))

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function encryptionKey() {
  const raw = String(process.env.AI_SETTINGS_ENCRYPTION_KEY || "").trim()
  if (!raw) return null
  if (/^[a-f0-9]{64}$/i.test(raw)) return Buffer.from(raw, "hex")
  try {
    const decoded = Buffer.from(raw, "base64")
    return decoded.length === 32 ? decoded : null
  } catch {
    return null
  }
}

function storageStatus() {
  if (!serviceClient()) {
    return { ready: false, message: "SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi pada server." }
  }
  if (!encryptionKey()) {
    return { ready: false, message: "AI_SETTINGS_ENCRYPTION_KEY harus berupa 32 byte base64 atau 64 karakter hex." }
  }
  return { ready: true, message: "" }
}

function encryptSecret(secret) {
  const key = encryptionKey()
  if (!key) throw new Error("Master key enkripsi AI belum valid.")
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`
}

function decryptSecret(payload) {
  const key = encryptionKey()
  if (!key) throw new Error("Master key enkripsi AI belum valid.")
  const [version, ivValue, tagValue, ciphertextValue] = String(payload || "").split(".")
  if (version !== "v1" || !ivValue || !tagValue || !ciphertextValue) throw new Error("Format API key terenkripsi tidak valid.")
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivValue, "base64url"))
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"))
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64url")),
      decipher.final(),
    ]).toString("utf8")
  } catch {
    throw new Error("API key tidak dapat dibuka. Pastikan AI_SETTINGS_ENCRYPTION_KEY tidak berubah.")
  }
}

function environmentConfig() {
  const apiKey = String(process.env.OPENROUTER_API_KEY || "").trim()
  return {
    source: apiKey ? "environment" : "none",
    provider: "openrouter",
    model: process.env.OPENROUTER_MODEL || PROVIDERS.openrouter.defaultModel,
    temperature: 0.2,
    maxTokens: 6000,
    apiKey,
    keyHint: apiKey ? apiKey.slice(-4) : "",
    updatedAt: null,
  }
}

async function storedRow(userId) {
  const client = serviceClient()
  if (!client) return { row: null, error: null }
  const { data, error } = await client.from("ai_settings").select("*").eq("user_id", userId).maybeSingle()
  return { row: data || null, error }
}

function publicConfig(config, status = storageStatus()) {
  const provider = PROVIDERS[config.provider] || PROVIDERS.openrouter
  return {
    storageReady: status.ready,
    storageMessage: status.message,
    source: config.source,
    provider: config.provider,
    providerLabel: provider.label,
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    hasApiKey: Boolean(config.apiKey || config.keyHint),
    keyHint: config.keyHint || "",
    updatedAt: config.updatedAt || null,
    providers: AI_PROVIDER_OPTIONS,
  }
}

function rowConfig(row) {
  return {
    source: "dashboard",
    provider: row.provider,
    model: row.model,
    temperature: Number(row.temperature),
    maxTokens: Number(row.max_tokens),
    apiKey: decryptSecret(row.api_key_encrypted),
    keyHint: row.api_key_hint || "",
    updatedAt: row.updated_at,
  }
}

export async function getPublicAISettings(userId) {
  const status = storageStatus()
  if (status.ready) {
    const { row, error } = await storedRow(userId)
    if (error?.code === "42P01") {
      return publicConfig(environmentConfig(), {
        ready: false,
        message: "Tabel ai_settings belum tersedia. Jalankan schema Supabase terbaru.",
      })
    }
    if (error) throw new Error("Konfigurasi AI tidak dapat dibaca.")
    if (row) return publicConfig(rowConfig(row), status)
  }
  return publicConfig(environmentConfig(), status)
}

export async function resolveAISettings(userId) {
  const status = storageStatus()
  if (status.ready) {
    const { row, error } = await storedRow(userId)
    if (!error && row) {
      const config = rowConfig(row)
      return { ...config, endpoint: PROVIDERS[config.provider].endpoint }
    }
  }
  const fallback = environmentConfig()
  if (!fallback.apiKey) throw new Error("API key AI belum dikonfigurasi di dashboard atau environment server.")
  return { ...fallback, endpoint: PROVIDERS.openrouter.endpoint }
}

function validatedSettings(input) {
  const provider = String(input?.provider || "").trim().toLowerCase()
  if (!PROVIDERS[provider]) throw new Error("Provider AI tidak didukung.")
  const model = String(input?.model || "").trim()
  if (!model || model.length > 200 || /[\r\n]/.test(model)) throw new Error("Nama model AI tidak valid.")
  const temperature = Number(input?.temperature)
  if (!Number.isFinite(temperature) || temperature < 0 || temperature > 2) throw new Error("Temperature harus berada antara 0 dan 2.")
  const maxTokens = Number(input?.maxTokens)
  if (!Number.isInteger(maxTokens) || maxTokens < 256 || maxTokens > 16000) throw new Error("Max tokens harus berada antara 256 dan 16000.")
  const apiKey = String(input?.apiKey || "").trim()
  if (apiKey && (apiKey.length < 8 || apiKey.length > 500 || /[\r\n]/.test(apiKey))) throw new Error("Format API key tidak valid.")
  return { provider, model, temperature, maxTokens, apiKey }
}

export async function saveAISettings(userId, input) {
  const status = storageStatus()
  if (!status.ready) throw new Error(status.message)
  const values = validatedSettings(input)
  const client = serviceClient()
  const { row: existing, error: readError } = await storedRow(userId)
  if (readError && readError.code === "42P01") throw new Error("Tabel ai_settings belum tersedia. Jalankan schema Supabase terbaru.")
  if (readError) throw new Error("Konfigurasi AI lama tidak dapat dibaca.")

  let secret = values.apiKey
  if (!secret && existing && existing.provider !== values.provider) {
    throw new Error("Masukkan API key baru ketika mengganti provider.")
  }
  if (!secret && existing?.api_key_encrypted) secret = decryptSecret(existing.api_key_encrypted)
  if (!secret) {
    const fallback = environmentConfig()
    if (fallback.apiKey && values.provider === fallback.provider) secret = fallback.apiKey
  }
  if (!secret) throw new Error("Masukkan API key untuk provider yang dipilih.")

  const updatedAt = new Date().toISOString()
  const payload = {
    user_id: userId,
    provider: values.provider,
    model: values.model,
    temperature: values.temperature,
    max_tokens: values.maxTokens,
    api_key_encrypted: encryptSecret(secret),
    api_key_hint: secret.slice(-4),
    updated_at: updatedAt,
  }
  const { error } = await client.from("ai_settings").upsert(payload, { onConflict: "user_id" })
  if (error?.code === "42P01") throw new Error("Tabel ai_settings belum tersedia. Jalankan schema Supabase terbaru.")
  if (error) throw new Error("Konfigurasi AI gagal disimpan.")
  return publicConfig({ ...values, source: "dashboard", apiKey: "", keyHint: secret.slice(-4), updatedAt }, status)
}

export async function resetAISettings(userId) {
  const status = storageStatus()
  if (!status.ready) throw new Error(status.message)
  const { error } = await serviceClient().from("ai_settings").delete().eq("user_id", userId)
  if (error?.code === "42P01") throw new Error("Tabel ai_settings belum tersedia. Jalankan schema Supabase terbaru.")
  if (error) throw new Error("Konfigurasi AI gagal direset.")
  return publicConfig(environmentConfig(), status)
}

export function providerHeaders(config) {
  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  }
  if (config.provider === "openrouter") {
    headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    headers["X-Title"] = "Portfolio Admin AI"
  }
  return headers
}
