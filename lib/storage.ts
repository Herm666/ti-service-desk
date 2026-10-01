import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";

/**
 * Armazenamento de anexos (prints, PDFs, fotos etc.) via Vercel Blob.
 * Substitui a gravação em disco local (public/uploads), que não
 * funciona em ambiente serverless (filesystem efêmero/somente leitura).
 *
 * Requer a variável de ambiente BLOB_READ_WRITE_TOKEN, criada
 * automaticamente ao conectar um Blob Store ao projeto na Vercel.
 */
export async function saveAttachment(file: File) {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `tickets/${randomUUID()}-${safe}`;
  const blob = await put(key, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteAttachment(url: string) {
  try {
    await del(url);
  } catch {
    // se o arquivo já não existir no storage, apenas ignora
  }
}
