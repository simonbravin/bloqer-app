/**
 * Lista de países para desplegables (registro, organización).
 * Valores almacenados tal cual en Organization.country / OrgProfile.country.
 */
export const COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Brasil',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Ecuador',
  'El Salvador',
  'España',
  'Estados Unidos',
  'Guatemala',
  'Honduras',
  'México',
  'Panamá',
  'Paraguay',
  'Perú',
  'Uruguay',
  'Venezuela',
] as const

export type CountryCode = (typeof COUNTRIES)[number]
