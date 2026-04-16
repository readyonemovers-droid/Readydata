/**
 * Upload a file using the presigned URL flow:
 * 1. Request a presigned URL from our API
 * 2. PUT the file directly to GCS
 * Returns the objectPath to store in the database.
 */
export async function uploadFile(file: File): Promise<string> {
  // Step 1: Get presigned URL from our API
  const metaRes = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
    }),
  });

  if (!metaRes.ok) {
    throw new Error("Failed to get upload URL");
  }

  const { uploadURL, objectPath } = (await metaRes.json()) as {
    uploadURL: string;
    objectPath: string;
  };

  // Step 2: PUT the file directly to GCS
  const uploadRes = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("File upload to storage failed");
  }

  return objectPath;
}

/** Build a serving URL from an objectPath stored in the database */
export function buildObjectUrl(objectPath: string | null | undefined): string | null {
  if (!objectPath) return null;
  return `/api/storage${objectPath}`;
}
