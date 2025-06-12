/*
User return data
Settings, Profile, HeaderInfo
*/

export type HeaderInfo = {
  avatarUrl: string; // URL to the avatar image
  username: string; // Username of the logged-in user
  isAdmin: boolean; // Whether the user is an admin
};

export type User = {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
};

export type UserProfile = {
  id: string;
  username: string;
  name: string;
  status: string;
  location: string;
  description: string;
  avatarUrl: string; // URL to the avatar image
  role: string;
  dateJoined: string;
};

export type AccountSettings = {
  account: User;
  profile: UserProfile;
};

export type UserProfileUpdate = {
  name?: string;
  status?: string;
  location?: string;
  description?: string;
  avatar?: File; // For multipart/form-data
};

/*
VPN return data
*/

/**
 * Generic Information about a VPN client
 * This is used to list all VPN clients and their basic information
 */
export type VPNClient = {
  id: string;
  name: string;
  addresses: string;
  clientPublicKey: string;
  created: string;
  alternativeRoute: boolean;
  state: 'NEW' | 'PROCESSING' | 'CREATED' | 'FAILED' | 'DELETING';
  // frontend stuff
  selected?: boolean; // Whether the VPN client is selected in the UI
};

/**
 * Connection details for a VPN client
 * This contains all the necessary information to establish a VPN connection
 * The data returned here will only ever be shown once, when the VPN client is created
 */
export type VPNConnection = {
  name: string; // Name of the VPN connection
  addresses: string; // Comma-separated list of IP addresses
  clientPublicKey: string; // Public key for the client
  clientPrivateKey?: string; // Private key for the client (not transmitted)
  allowedIps: string; // Allowed IPs for the VPN
  serverPublicKey: string; // Public key for the server
  presharedKey: string; // Preshared key for the connection
  dnsServers: string; // Comma-separated list of DNS servers
  allowedIpsInternal: string; // Internal allowed IPs for the VPN
  endpoint: string; // Endpoint address for the VPN server
};

/*
File Data
*/

export interface BaseFileNode {
  // Basic identification and structural fields
  id: string; // UUID string
  name: string; // File/folder name
  nodeType: 'file' | 'folder'; // Type of node

  // Path and size information
  displayPath: string; // User-friendly path without root storage path
  displaySize: string; // Human-readable file size (e.g., "2.5 MB")
  sizeBytes: number; // Size in bytes
  mimeType: string; // MIME type (e.g., "application/pdf", "image/jpeg")

  // Timestamp fields
  created: string; // Formatted date string (Y-m-d, H:M:S)
  modified: string; // Formatted date string (Y-m-d, H:M:S)
  createdIso: string; // ISO 8601 date format
  modifiedIso: string; // ISO 8601 date format

  // Sharing settings
  isShared: boolean; // Whether the node is shared
  allowPublicRead: boolean; // Whether public read is allowed
  allowPublicWrite: boolean; // Whether public write is allowed
  isPasswordProtected: boolean; // Whether password protection is enabled

  owner: string; // Username of the owner

  // Children nodes (for folders)
  children?: FileNode[]; // Child nodes when retrieving a folder

  // frontend stuff
  selected?: boolean; // Whether the node is selected in the UI
  highlight?: boolean; // Whether the node is highlighted in the UI
}

// File-specific interface
export interface FileNodeFile extends BaseFileNode {
  nodeType: 'file';
}

// Folder-specific interface
export interface FileNodeFolder extends BaseFileNode {
  nodeType: 'folder';
  children: FileNode[]; // Child nodes - required for folders

  // frontend stuff
  dragOver?: boolean; // Whether the folder is being dragged over in the UI
}

// Union type that represents either a file or a folder
export type FileNode = FileNodeFile | FileNodeFolder;

// Type guard to check if a FileNode is a folder
export function isFolder(node: FileNode): node is FileNodeFolder {
  return node.nodeType === 'folder';
}

// Type guard to check if a FileNode is a file
export function isFile(node: FileNode): node is FileNodeFile {
  return node.nodeType === 'file';
}

export interface FolderTreeNode {
  id: string; // UUID string
  name: string; // Folder name
  nodeType: 'file' | 'folder'; // Type of node
  children?: FolderTreeNode[]; // Child nodes for folders
}

/**
 * Upload Session Types
 */

export type UploadSession = {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  parentFolderId: string;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number;
  status: 'UPLOADING' | 'COMPLETED' | 'FAILED' | 'CANCELED'; // Removed 'ESTABLISHED'
  createdAt: string;
  progress: number;
  user: string;
};

/**
 * Initiate a new upload session
 */
export type UploadSessionCreateRequest = {
  filename: string;
  fileSize: number;
  mimeType: string;
  parentFolderId: string;
  chunkSize: number;
  totalChunks: number;
};

export type UploadChunkRequest = {
  chunk: File; // For multipart/form-data
  chunkIndex: number;
};

export type UploadChunk = {
  sessionId: string;
  chunkIndex: number;
  size: number;
  createdAt: string;
};

export type FileContent = {
  id: string; // File ID
  content: string | null; // Base64 encoded content for binary files, text for text files
  displaySize: string; // Human-readable size (e.g., "2.5 MB")
  sizeBytes: number; // Size in bytes
};

///////////////////////////////////////////

export type AuthResponse = {
  isAuthenticated: boolean;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type SignUpRequest = {
  username: string;
  email: string;
  password: string;
  captchaId: string;
  captchaValue: string;
};

export type CaptchaResponse = {
  img: string;
  id: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type ErrorResponse = {
  error: string;
};

/**
 * File System Types
 */

export type FileNodeList = {
  id: string;
  name: string;
  nodeType: 'file' | 'folder';
  displayPath: string;
  displaySize: string;
  mimeType: string;
  modified: string;
  isShared: boolean;
};

export type FileNodeContent = {
  id: string;
  content: string | null; // Base64 for binary, text for text files
  displaySize: string;
  sizeBytes: number;
};

export type FileNodeCreateRequest = {
  name: string;
  nodeType: 'file' | 'folder';
  parentId?: string;
  mimeType?: string;
  fileContent?: File; // For multipart/form-data
};

export type FileNodeUpdateRequest = {
  name?: string;
  parentId?: string;
  isShared?: boolean;
  allowPublicRead?: boolean;
  allowPublicWrite?: boolean;
  isPasswordProtected?: boolean;
  passwordHash?: string;
  applyRecursively?: boolean;
};

export type FileNodeContentUpdateRequest = {
  content: string;
};

export type FolderContentsResponse = {
  folder: FileNode;
  children: FileNodeList[];
};

/**
 * VPN Types
 */

export type VPNClientCreateRequest = {
  name: string;
};

/**
 * Pagination and Common Types
 */

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
};

/**
 * Action Responses
 */

export type ActionResponse = {
  success: boolean;
  message?: string;
};

export type ZipDownloadResponse = {
  filename: string;
  contentType: string;
  content: string; // Base64 encoded zip content
};

export type TokenResponse = {
  token: string;
  expiresAt: string;
};

/**
 * API Routes
 */

export const ApiRoutes = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    authenticated: '/auth/authenticated',
    captcha: '/auth/captcha',
    csrfToken: '/auth/csrf_cookie',
    changePassword: '/auth/users/change_password',
  },
  profile: {
    me: '/profile/profiles/me',
    byUsername: '/profile/profiles/by-username',
    headerInfo: '/profile/header-information',
    accountSettings: '/profile/profiles/account-settings',
  },
  files: {
    nodes: '/files/nodes',
    rootFolder: '/files/nodes/root-folder',
    content: (id: string) => `/files/nodes/${id}/content`,
    folderTree: (id: string) => `/files/nodes/${id}/folder-tree`,
    download: (id: string) => `/files/nodes/${id}/download`,
    zip: (id: string) => `/files/nodes/${id}/zip`,
    uploadSessions: '/files/upload-sessions',
    uploadChunk: (sessionId: string) => `/files/upload-sessions/${sessionId}/upload-chunk`,
    finalizeUpload: (sessionId: string) => `/files/upload-sessions/${sessionId}/finalize`,
  },
  vpn: {
    clients: '/vpn/clients',
    downloadConfig: (id: string) => `/vpn/clients/${id}/download`,
  },
};
