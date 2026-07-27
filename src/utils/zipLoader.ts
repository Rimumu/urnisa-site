export interface ExtractedHatData {
  elements: any[];
  textureUrl: string;
  textureSize?: [number, number];
}

let hatsIndexCache: { [key: string]: number } | null = null;
const loadedChunks: { [key: number]: any } = {};

export async function fetchHatsIndex() {
  if (!hatsIndexCache) {
    const response = await fetch(`/hats_index.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch hats index (status ${response.status})`);
    }
    hatsIndexCache = await response.json();
  }
  return hatsIndexCache!;
}

export async function fetchHatsChunk(chunkIndex: number) {
  if (!loadedChunks[chunkIndex]) {
    const response = await fetch(`/hats_chunk_${chunkIndex}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch chunk ${chunkIndex} (status ${response.status})`);
    }
    loadedChunks[chunkIndex] = await response.json();
  }
  return loadedChunks[chunkIndex];
}

export async function extractHatAssets(modelId: string): Promise<ExtractedHatData> {
  const index = await fetchHatsIndex();
  
  const chunkIdx = index[modelId];
  if (chunkIdx === undefined) {
    throw new Error(`Model ${modelId} not found in index`);
  }
  
  const chunkData = await fetchHatsChunk(chunkIdx);
  
  const modelData = chunkData.models[modelId];
  if (!modelData) {
    throw new Error(`Model not found for ${modelId}`);
  }
  
  const textureBase64 = chunkData.textures[modelId];
  if (!textureBase64) {
    throw new Error(`Texture not found for ${modelId}`);
  }
  
  const textureUrl = `data:image/png;base64,${textureBase64}`;
  
  return {
    elements: modelData.elements || [],
    textureUrl,
    textureSize: modelData.texture_size
  };
}
