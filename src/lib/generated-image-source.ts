export type GeneratedImageSource =
  | { kind: 'inline'; buffer: Buffer; mimeType: string }
  | { kind: 'remote'; url: string };

const DATA_URL = /^data:([^;,]+);base64,([\s\S]+)$/i;
const RAW_BASE64 = /^[A-Za-z0-9+/\s]+={0,2}$/;

export function parseGeneratedImageSource(value: string): GeneratedImageSource {
  const source = value.trim();
  if (!source) throw new Error('El proveedor no devolvió datos de imagen.');

  const data = source.match(DATA_URL);
  if (data) {
    return { kind: 'inline', buffer: Buffer.from(data[2].replace(/\s/g, ''), 'base64'), mimeType: data[1] || 'image/png' };
  }

  if (source.length > 128 && RAW_BASE64.test(source)) {
    return { kind: 'inline', buffer: Buffer.from(source.replace(/\s/g, ''), 'base64'), mimeType: 'image/png' };
  }

  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('unsupported protocol');
    return { kind: 'remote', url: url.toString() };
  } catch {
    throw new Error('El proveedor devolvió una imagen con una URL no válida.');
  }
}
