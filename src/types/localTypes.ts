// Add to your types/index.ts file
import type { CancelTokenSource } from 'axios';
import type { UploadSession } from './apiTypes';

/*
 * **********************************************************************
 * UPLOAD STATUS TRACKERS
 * **********************************************************************
 */

export enum UploadStatus {
  QUEUED = 'QUEUED',
  PREPARING = 'PREPARING',
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
}

export interface ChunkInfo {
  index: number; // Chunk index
  start: number; // Start byte position
  end: number; // End byte position
  status: UploadStatus; // Status of this chunk
  retries: number; // Number of retry attempts
}

export interface UploadProgressEntry {
  /* General Information */
  id: string; // Unique identifier for this upload
  name: string; // Display name for the upload
  parentId: string; // Folder ID where file will be uploaded
  type: 'file' | 'folder'; // Type of the upload (file or folder)

  /* Information about the actual file */
  content: File | FileSystemEntry; // The file being uploaded
  mimeType: string; // MIME type of the file
  sizeBytes: number; // Total size in bytes

  /* Upload Status Tracking fields */
  status: UploadStatus;
  message: string; // Status message or error
  uploadedBytes: number; // Bytes uploaded so far (for chunked)
  uploadSpeed: number; // Current upload speed in bytes/s
}

export interface RegularUploadProgressEntry extends UploadProgressEntry {
  type: 'file'; // Explicitly set type for regular file uploads
  content: File; // The file being uploaded
  cancelToken: CancelTokenSource; // Cancellation token
}

export interface ChunkedUploadProgressEntry extends UploadProgressEntry {
  type: 'file'; // Explicitly set type for chunked file uploads
  content: File; // The file being uploaded
  sessionInfo?: UploadSession; // session infom returned by server
  chunks: ChunkInfo[]; // Array of chunk information
}

export interface TrackerNode {
  localId: string;
  name: string;
  type: 'folder' | 'file';
  created: boolean;
  parentLocalId: string | null;
  parentRemoteId?: string | null; // Make optional initially
  depth: number; // Depth in the folder structure
}

export interface FolderTrackerNode extends TrackerNode {
  type: 'folder';
  content: FileSystemDirectoryEntry; // More specific typing
  remoteId?: string | null; // Optional until created
  created: boolean; // Required for folders to track creation status
}

export interface FileTrackerNode extends TrackerNode {
  type: 'file';
  content: File; // Files always have File content
}

// Union type for better type safety
export type AnyTrackerNode = FolderTrackerNode | FileTrackerNode;

// Type guards for better type safety
export function isFolderTrackerNode(node: AnyTrackerNode): node is FolderTrackerNode {
  return node.type === 'folder';
}

export function isFileTrackerNode(node: AnyTrackerNode): node is FileTrackerNode {
  return node.type === 'file';
}

export interface FolderUploadProgressEntry extends UploadProgressEntry {
  type: 'folder';
  content: FileSystemDirectoryEntry; // The folder being uploaded
  structureInitialized: boolean;
  foldersInitialized: boolean;
  nodes: AnyTrackerNode[]; // Flat structure of all nodes in the folder
  nodeProgressTypeMap: Map<string, RegularUploadProgressEntry | ChunkedUploadProgressEntry>; // Map of localId to upload status
}

export function isRegularUpload(
  upload: AnyUploadProgressEntry,
): upload is RegularUploadProgressEntry {
  return 'cancelToken' in upload;
}

export function isChunkedUpload(
  upload: AnyUploadProgressEntry,
): upload is ChunkedUploadProgressEntry {
  return 'chunks' in upload;
}

export function isFolderUpload(
  upload: AnyUploadProgressEntry,
): upload is FolderUploadProgressEntry {
  return upload.type === 'folder';
}

export type AnyUploadProgressEntry =
  | RegularUploadProgressEntry
  | ChunkedUploadProgressEntry
  | FolderUploadProgressEntry;

/*
 * **********************************************************************
 * **********************************************************************
 * **********************************************************************
 */

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
  parentId: string;
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
