export async function parseFileContent(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return new TextDecoder().decode(buffer);
}
