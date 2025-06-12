import { useChunkedUpload } from './chunkedUpload';
import { useFolderUpload } from './folderUpload';
import { uploadStatusUtils } from './helpers/uploadStatus';
import type {
  AnyUploadProgressEntry,
  ChunkedUploadProgressEntry,
  FolderUploadProgressEntry,
  RegularUploadProgressEntry,
} from 'src/types/localTypes';

export interface UploadHandler {
  execute(upload: AnyUploadProgressEntry): Promise<boolean> | void;
  cancel(upload: AnyUploadProgressEntry): Promise<void> | void;
  retry(upload: AnyUploadProgressEntry): Promise<void> | void;
}

export class RegularUploadHandler implements UploadHandler {
  constructor(
    private executeRegularUpload: (upload: RegularUploadProgressEntry) => Promise<boolean>,
  ) {}

  async execute(upload: AnyUploadProgressEntry): Promise<boolean> {
    return this.executeRegularUpload(upload as RegularUploadProgressEntry);
  }

  cancel(upload: AnyUploadProgressEntry): void {
    const regularUpload = upload as RegularUploadProgressEntry;
    uploadStatusUtils.markAsCanceled(regularUpload);
    regularUpload.cancelToken.cancel('Upload canceled by user');
  }

  retry(upload: AnyUploadProgressEntry): void {
    uploadStatusUtils.resetForRetry(upload);
  }
}

export class ChunkedUploadHandler implements UploadHandler {
  private chunkedUpload = useChunkedUpload();

  constructor(
    private executeChunkedUpload: (upload: ChunkedUploadProgressEntry) => Promise<boolean>,
  ) {}

  async execute(upload: AnyUploadProgressEntry): Promise<boolean> {
    return this.executeChunkedUpload(upload as ChunkedUploadProgressEntry);
  }

  async cancel(upload: AnyUploadProgressEntry): Promise<void> {
    const chunkedUpload = upload as ChunkedUploadProgressEntry;
    uploadStatusUtils.markAsCanceled(chunkedUpload);
    await this.chunkedUpload.cancelUpload(chunkedUpload);
  }

  retry(upload: AnyUploadProgressEntry): void {
    uploadStatusUtils.resetForRetry(upload);
  }
}

export class FolderUploadHandler implements UploadHandler {
  private folderUpload = useFolderUpload();

  constructor(
    private executeFolderUpload: (upload: FolderUploadProgressEntry) => Promise<boolean>,
    private addToQueue?: (
      entries: (RegularUploadProgressEntry | ChunkedUploadProgressEntry)[],
    ) => void,
  ) {}

  async execute(upload: AnyUploadProgressEntry): Promise<boolean> {
    return this.executeFolderUpload(upload as FolderUploadProgressEntry);
  }

  async cancel(upload: AnyUploadProgressEntry): Promise<void> {
    const folderUpload = upload as FolderUploadProgressEntry;
    await this.folderUpload.cancelFolderUpload(folderUpload);
  }

  async retry(upload: AnyUploadProgressEntry): Promise<void> {
    const folderUpload = upload as FolderUploadProgressEntry;
    const retryResult = await this.folderUpload.retryFolderUpload(folderUpload);

    if (!retryResult.success) {
      uploadStatusUtils.markAsFailed(folderUpload, 'Retry failed');
      return;
    }

    // Add file entries to queue if they exist
    if (retryResult.fileEntries && retryResult.fileEntries.length > 0 && this.addToQueue) {
      this.addToQueue(retryResult.fileEntries);
    }
  }
}
