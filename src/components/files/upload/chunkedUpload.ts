import { Cookies } from 'quasar';
import { apiDelete, apiPost } from 'src/api/apiWrapper';
import type { UploadSession, UploadSessionCreateRequest } from 'src/types/apiTypes';
import type { ChunkedUploadProgressEntry, ChunkInfo } from 'src/types/localTypes';
import { UploadStatus } from 'src/types/localTypes';

const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks

function getAxiosConfig() {
  return {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken'),
    },
  };
}

export function useChunkedUpload() {
  /**
   * Initialize a new chunked upload session with the server
   */
  async function initUpload(
    upload: ChunkedUploadProgressEntry,
    chunkSize: number = CHUNK_SIZE,
  ): Promise<void> {
    const file = upload.content;
    const totalChunks = Math.ceil(file.size / chunkSize);

    // Prepare chunks info
    upload.chunks = [];
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      upload.chunks.push({
        index: i,
        start,
        end,
        status: UploadStatus.QUEUED,
        retries: 0,
      });
    }

    const sessionRequest: UploadSessionCreateRequest = {
      filename: upload.name,
      parentFolderId: upload.parentId,
      fileSize: file.size,
      mimeType: file.type,
      totalChunks,
      chunkSize,
    };

    // Initialize session with server
    const response = await apiPost('files/uploads/', sessionRequest, getAxiosConfig());

    if (response.error) {
      throw new Error(response.errorMessage || 'Failed to initialize upload session');
    }

    const sessionData: UploadSession = response.data;
    upload.sessionInfo = sessionData;
  }

  /**
   * Start uploading chunks for a chunked upload
   */
  async function startUpload(upload: ChunkedUploadProgressEntry): Promise<void> {
    if (!upload || !upload.sessionInfo) {
      throw new Error('Upload not initialized');
    }

    upload.status = UploadStatus.UPLOADING;

    // Store the last update time for speed calculation
    let lastUpdateTime = Date.now();
    let lastUploadedBytes = upload.uploadedBytes;

    // Get chunks that need to be uploaded
    const pendingChunks = upload.chunks.filter((chunk) => chunk.status !== UploadStatus.COMPLETED);

    // Use limited concurrency
    const concurrencyLimit = 3;

    // Process chunks in batches with limited concurrency
    try {
      for (let i = 0; i < pendingChunks.length; i += concurrencyLimit) {
        // Exit early if upload is canceled
        // @ts-expect-error Can be set to CANCELED through the cancelUpload function
        if (upload.status === UploadStatus.CANCELED) {
          throw new Error('Upload was canceled');
        }

        const chunkBatch = pendingChunks.slice(i, i + concurrencyLimit);

        // Upload chunks in this batch concurrently
        await Promise.all(
          chunkBatch.map(async (chunk) => {
            if (upload.status === UploadStatus.CANCELED) {
              chunk.status = UploadStatus.CANCELED;
              return;
            }
            return uploadChunk(upload, chunk);
          }),
        );

        // Calculate upload speed every batch
        const now = Date.now();
        const timeElapsed = (now - lastUpdateTime) / 1000;
        if (timeElapsed > 0) {
          upload.uploadSpeed = (upload.uploadedBytes - lastUploadedBytes) / timeElapsed;
          lastUpdateTime = now;
          lastUploadedBytes = upload.uploadedBytes;
        }
      }

      // @ts-expect-error Can be set to CANCELED through the cancelUpload function
      if (upload.status === UploadStatus.CANCELED) {
        // Upload was canceled, don't finalize
        return;
      }

      // Check if all chunks are complete
      const allComplete = upload.chunks.every((chunk) => chunk.status === UploadStatus.COMPLETED);
      // @ts-expect-error Can be set to CANCELED through the cancelUpload function
      if (allComplete && upload.status !== UploadStatus.CANCELED) {
        // Finalize the upload
        await finalizeUpload(upload);
      }
    } catch (error: any) {
      // @ts-expect-error Can be set to CANCELED through the cancelUpload function
      if (upload.status !== UploadStatus.CANCELED) {
        upload.status = UploadStatus.FAILED;
        upload.message = error.message || 'Upload failed';
      }
      throw error;
    }
  }

  /**
   * Upload a single chunk
   */
  async function uploadChunk(upload: ChunkedUploadProgressEntry, chunk: ChunkInfo): Promise<void> {
    if (!upload.content || !upload.sessionInfo) return;

    // Skip completed chunks
    if (chunk.status === UploadStatus.COMPLETED) return;

    // skip if cancelled
    if (upload.status === UploadStatus.CANCELED) {
      chunk.status = UploadStatus.CANCELED;
      return;
    }

    // Mark as uploading
    chunk.status = UploadStatus.UPLOADING;

    try {
      // Extract the chunk data
      const chunkData = upload.content.slice(chunk.start, chunk.end);

      // Prepare form data
      const formData = new FormData();
      formData.append('chunk', chunkData);
      formData.append('chunk_index', chunk.index.toString());

      const response = await apiPost(
        `files/uploads/${upload.sessionInfo.id}/upload_chunk/`,
        formData,
        getAxiosConfig(),
      );

      if (response.error) {
        throw new Error(response.errorMessage || `Failed to upload chunk ${chunk.index}`);
      }

      // Update chunk status
      chunk.status = UploadStatus.COMPLETED;
      if (upload.sessionInfo) {
        upload.sessionInfo.uploadedChunks =
          response.data.uploadedChunks || upload.sessionInfo.uploadedChunks + 1;
      }

      // Update the overall upload progress
      upload.uploadedBytes += chunk.end - chunk.start;
    } catch (error: any) {
      // @ts-expect-error Can be set to CANCELED through the cancelUpload function
      if (upload.status === UploadStatus.CANCELED) {
        chunk.status = UploadStatus.CANCELED;
        return;
      }

      // Check if this was an abort error (user-initiated cancel)
      if (error.name === 'AbortError') {
        chunk.status = UploadStatus.CANCELED;
        upload.status = UploadStatus.CANCELED;
        return;
      }

      // Handle chunk upload failure (with retry logic)
      if (chunk.retries < 3) {
        chunk.retries++;
        chunk.status = UploadStatus.QUEUED;
        throw new Error(`Chunk ${chunk.index} failed, will retry`);
      } else {
        chunk.status = UploadStatus.FAILED;
        throw new Error(
          `Failed to upload chunk ${chunk.index} after ${chunk.retries} retries: ${error.message}`,
        );
      }
    }
  }

  /**
   * Cancel an upload session on the server
   */
  async function cancelUpload(upload: ChunkedUploadProgressEntry): Promise<void> {
    if (!upload.sessionInfo) return;

    try {
      await apiDelete(`files/uploads/${upload.sessionInfo.id}/`, getAxiosConfig());
    } catch (error: any) {
      console.error('Failed to cancel upload on server:', error);
      // Don't throw - local cancellation is still valid
    }
    upload.status = UploadStatus.CANCELED;
  }

  /**
   * Finalize a completed upload
   */
  async function finalizeUpload(upload: ChunkedUploadProgressEntry): Promise<void> {
    if (!upload.sessionInfo) return;

    const response = await apiPost(
      `files/uploads/${upload.sessionInfo.id}/complete/`,
      {},
      getAxiosConfig(),
    );

    if (response.error) {
      throw new Error(response.errorMessage || 'Failed to finalize upload');
    }

    upload.uploadedBytes = upload.sizeBytes;
  }

  return {
    initUpload,
    startUpload,
    cancelUpload,
    CHUNK_SIZE,
  };
}
