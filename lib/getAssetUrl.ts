export type AssetKey = "small" | "medium" | "full";

/**
 * Construye la URL de un asset de Directus servido vía el proxy /webapi/assets/*.
 * Sin `key`, Directus devuelve el archivo original (útil para PDFs/adjuntos, no solo imágenes).
 */
export function getAssetUrl(id: string, key?: AssetKey): string {
  return key ? `/webapi/assets/${id}?key=${key}` : `/webapi/assets/${id}`;
}
