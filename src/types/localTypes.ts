import type { CancelTokenSource } from 'axios';

// Add to your types/index.ts file

export enum UploadStatus {
  QUEUED = 'queued', // Upload is queued but not started
  UPLOADING = 'uploading', // Upload is in progress
  COMPLETED = 'completed', // Upload completed successfully
  FAILED = 'failed', // Upload failed
  CANCELED = 'canceled', // Upload was canceled by user
}

export interface ChunkInfo {
  index: number; // Chunk index
  start: number; // Start byte position
  end: number; // End byte position
  status: UploadStatus; // Status of this chunk
  retries: number; // Number of retry attempts
  uploadedAt?: Date; // When the chunk was uploaded
}

export interface UploadSessionInfo {
  sessionId: string; // Server-assigned session ID
  filename: string; // Original filename
  fileSize: number; // Total file size in bytes
  mimeType: string; // File MIME type
  chunkSize: number; // Size of each chunk in bytes
  totalChunks: number; // Total number of chunks
  chunks: ChunkInfo[]; // Information about each chunk
  uploadedChunks: number; // Number of chunks successfully uploaded
}

export interface UploadTrackingInfo {
  id: string; // Unique identifier for this upload
  name: string; // Display name for the upload
  status: UploadStatus; // Current status
  parentId: string; // Folder ID where file will be uploaded
  size: number; // Total size in bytes
  uploadedBytes: number; // Bytes uploaded so far
  uploadSpeed: number; // Current upload speed in bytes/s
  message: string; // Status message or error
  sourceFile?: File; // Original file (if available)
  sessionInfo?: UploadSessionInfo; // Detailed session info for chunked uploads
}

export interface UploadProgressEntry {
  name: string;
  status: string;
  message: string;
  abort: CancelTokenSource;
  size: string;
  transferred: string;
  transferredPercent: number;
}
export interface TraverseFolderMapType {
  type: string;
  id: number;
  name: string;
  entry?: FileSystemEntry;
  parentId: number;
  folderId?: number;
}
// An Item in the UploadDialog,
export interface UploadPreviewEntry {
  name: string;
  type: string;
  content: File | FileSystemEntry;
  // if edit mode is enabled
  edit: boolean;
  // string in edit mode
  edit_name: string;
}

export interface NavbarIndexType {
  homeFolderId: string;
  navbarItems: { name: string; id: string }[];
  menuItems: { name: string; id: string }[];
  lastMovedItemId: string;
}

export interface VPNSetupType {
  clientPublicKey: string;
  clientPrivateKey: string;
  name: string;
  autoKeyGeneration: boolean;
  alternativeRoute: boolean;
}

export interface VPNConnectionType {
  name: string;
  addresses: string;
  clientPublicKey: string;
  clientPrivateKey: string;
  serverPublicKey: string;
  presharedKey: string;
  dnsServers: string;
  allowedIps: string;
  allowedIpsInternal: string;
  endpoint: string;
}
