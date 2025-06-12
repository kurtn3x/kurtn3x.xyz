import type { FileNode, FileNodeFile, FileNodeFolder, FolderTreeNode } from './apiTypes';

/**
 * Creates a mock folder with diverse children for testing the file explorer
 * Contains a mix of folders and files with various mime types
 */
export const createMockFolder = (): FileNodeFolder => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Create folders (with proper typing)
  const foldersList: FileNodeFolder[] = [
    {
      id: 'folder_001',
      name: 'Documents This is A Super long folder name to test the UI',
      nodeType: 'folder',
      displayPath: '/Documents',
      displaySize: '0 B',
      sizeBytes: 0,
      mimeType: 'directory',
      created: oneMonthAgo.toLocaleString(),
      modified: oneDayAgo.toLocaleString(),
      createdIso: oneMonthAgo.toISOString(),
      modifiedIso: oneDayAgo.toISOString(),
      isShared: true,
      allowPublicRead: true,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
      children: [], // Empty folders initially
    },
    {
      id: 'folder_002',
      name: 'Photos',
      nodeType: 'folder',
      displayPath: '/Photos',
      displaySize: '0 B',
      sizeBytes: 0,
      mimeType: 'directory',
      created: oneMonthAgo.toLocaleString(),
      modified: oneWeekAgo.toLocaleString(),
      createdIso: oneMonthAgo.toISOString(),
      modifiedIso: oneWeekAgo.toISOString(),
      isShared: false,
      allowPublicRead: false,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
      children: [],
    },
    {
      id: 'folder_003',
      name: 'Videos',
      nodeType: 'folder',
      displayPath: '/Videos',
      displaySize: '0 B',
      sizeBytes: 0,
      mimeType: 'directory',
      created: oneMonthAgo.toLocaleString(),
      modified: oneMonthAgo.toLocaleString(),
      createdIso: oneMonthAgo.toISOString(),
      modifiedIso: oneMonthAgo.toISOString(),
      isShared: false,
      allowPublicRead: false,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
      children: [],
    },
    {
      id: 'folder_004',
      name: 'Projects',
      nodeType: 'folder',
      displayPath: '/Projects',
      displaySize: '0 B',
      sizeBytes: 0,
      mimeType: 'directory',
      created: oneWeekAgo.toLocaleString(),
      modified: oneHourAgo.toLocaleString(),
      createdIso: oneWeekAgo.toISOString(),
      modifiedIso: oneHourAgo.toISOString(),
      isShared: true,
      allowPublicRead: true,
      allowPublicWrite: true,
      isPasswordProtected: false,
      owner: 'testuser',
      children: [],
    },
    {
      id: 'folder_005',
      name: 'Archives',
      nodeType: 'folder',
      displayPath: '/Archives',
      displaySize: '0 B',
      sizeBytes: 0,
      mimeType: 'directory',
      created: oneMonthAgo.toLocaleString(),
      modified: oneMonthAgo.toLocaleString(),
      createdIso: oneMonthAgo.toISOString(),
      modifiedIso: oneMonthAgo.toISOString(),
      isShared: false,
      allowPublicRead: false,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
      children: [],
    },
  ];

  // Create files (with proper typing)
  const filesList: FileNodeFile[] = [
    // Text/Code files
    {
      id: 'file_001',
      name: 'notes.txt',
      nodeType: 'file',
      displayPath: '/notes.txt',
      displaySize: '15.2 KiB',
      sizeBytes: 15565,
      mimeType: 'text/plain',
      created: oneDayAgo.toLocaleString(),
      modified: oneDayAgo.toLocaleString(),
      createdIso: oneDayAgo.toISOString(),
      modifiedIso: oneDayAgo.toISOString(),
      isShared: false,
      allowPublicRead: false,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
    },
    {
      id: 'file_002',
      name: 'script.js',
      nodeType: 'file',
      displayPath: '/script.js',
      displaySize: '45.7 KiB',
      sizeBytes: 46797,
      mimeType: 'text/code-javascript',
      created: oneWeekAgo.toLocaleString(),
      modified: oneHourAgo.toLocaleString(),
      createdIso: oneWeekAgo.toISOString(),
      modifiedIso: oneHourAgo.toISOString(),
      isShared: true,
      allowPublicRead: true,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
    },
    {
      id: 'file_003',
      name: 'Documents This is A Super long file name to test the UI',
      nodeType: 'file',
      displayPath: '/styles.css',
      displaySize: '28.1 KiB',
      sizeBytes: 28774,
      mimeType: 'text/css',
      created: oneWeekAgo.toLocaleString(),
      modified: oneHourAgo.toLocaleString(),
      createdIso: oneWeekAgo.toISOString(),
      modifiedIso: oneHourAgo.toISOString(),
      isShared: false,
      allowPublicRead: false,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
    },
    {
      id: 'file_004',
      name: 'data.json',
      nodeType: 'file',
      displayPath: '/data.json',
      displaySize: '102.4 KiB',
      sizeBytes: 104858,
      mimeType: 'application/json',
      created: oneDayAgo.toLocaleString(),
      modified: oneHourAgo.toLocaleString(),
      createdIso: oneDayAgo.toISOString(),
      modifiedIso: oneHourAgo.toISOString(),
      isShared: false,
      allowPublicRead: false,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
    },
    {
      id: 'file_005',
      name: 'README.md',
      nodeType: 'file',
      displayPath: '/README.md',
      displaySize: '8.3 KiB',
      sizeBytes: 8499,
      mimeType: 'text/code-markdown',
      created: oneWeekAgo.toLocaleString(),
      modified: oneWeekAgo.toLocaleString(),
      createdIso: oneWeekAgo.toISOString(),
      modifiedIso: oneWeekAgo.toISOString(),
      isShared: true,
      allowPublicRead: true,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
    },

    // Image files
    {
      id: 'file_006',
      name: 'profile.jpg',
      nodeType: 'file',
      displayPath: '/profile.jpg',
      displaySize: '320.5 KiB',
      sizeBytes: 328192,
      mimeType: 'image/jpeg',
      created: oneMonthAgo.toLocaleString(),
      modified: oneMonthAgo.toLocaleString(),
      createdIso: oneMonthAgo.toISOString(),
      modifiedIso: oneMonthAgo.toISOString(),
      isShared: true,
      allowPublicRead: true,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
    },
    {
      id: 'file_007',
      name: 'icon.svg',
      nodeType: 'file',
      displayPath: '/icon.svg',
      displaySize: '15.7 KiB',
      sizeBytes: 16077,
      mimeType: 'image/svg+xml',
      created: oneWeekAgo.toLocaleString(),
      modified: oneWeekAgo.toLocaleString(),
      createdIso: oneWeekAgo.toISOString(),
      modifiedIso: oneWeekAgo.toISOString(),
      isShared: false,
      allowPublicRead: false,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
    },
    {
      id: 'file_008',
      name: 'banner.png',
      nodeType: 'file',
      displayPath: '/banner.png',
      displaySize: '540.2 KiB',
      sizeBytes: 553165,
      mimeType: 'image/png',
      created: oneDayAgo.toLocaleString(),
      modified: oneDayAgo.toLocaleString(),
      createdIso: oneDayAgo.toISOString(),
      modifiedIso: oneDayAgo.toISOString(),
      isShared: false,
      allowPublicRead: false,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
    },

    // Video files
    {
      id: 'file_009',
      name: 'presentation.mp4',
      nodeType: 'file',
      displayPath: '/presentation.mp4',
      displaySize: '24.5 MiB',
      sizeBytes: 25690112,
      mimeType: 'video/mp4',
      created: oneMonthAgo.toLocaleString(),
      modified: oneWeekAgo.toLocaleString(),
      createdIso: oneMonthAgo.toISOString(),
      modifiedIso: oneWeekAgo.toISOString(),
      isShared: true,
      allowPublicRead: true,
      allowPublicWrite: false,
      isPasswordProtected: true,
      owner: 'testuser',
    },
    {
      id: 'file_010',
      name: 'tutorial.mkv',
      nodeType: 'file',
      displayPath: '/tutorial.mkv',
      displaySize: '75.8 MiB',
      sizeBytes: 79458304,
      mimeType: 'video/x-matroska',
      created: oneWeekAgo.toLocaleString(),
      modified: oneWeekAgo.toLocaleString(),
      createdIso: oneWeekAgo.toISOString(),
      modifiedIso: oneWeekAgo.toISOString(),
      isShared: false,
      allowPublicRead: false,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
    },

    // Audio files
    {
      id: 'file_011',
      name: 'podcast.mp3',
      nodeType: 'file',
      displayPath: '/podcast.mp3',
      displaySize: '15.3 MiB',
      sizeBytes: 16039526,
      mimeType: 'audio/mpeg',
      created: oneDayAgo.toLocaleString(),
      modified: oneHourAgo.toLocaleString(),
      createdIso: oneDayAgo.toISOString(),
      modifiedIso: oneHourAgo.toISOString(),
      isShared: false,
      allowPublicRead: false,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
    },

    // PDF files
    {
      id: 'file_012',
      name: 'report.pdf',
      nodeType: 'file',
      displayPath: '/report.pdf',
      displaySize: '2.1 MiB',
      sizeBytes: 2201907,
      mimeType: 'application/pdf',
      created: oneMonthAgo.toLocaleString(),
      modified: oneMonthAgo.toLocaleString(),
      createdIso: oneMonthAgo.toISOString(),
      modifiedIso: oneMonthAgo.toISOString(),
      isShared: true,
      allowPublicRead: true,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
    },
    {
      id: 'file_013',
      name: 'contract.pdf',
      nodeType: 'file',
      displayPath: '/contract.pdf',
      displaySize: '4.5 MiB',
      sizeBytes: 4718592,
      mimeType: 'application/pdf',
      created: oneWeekAgo.toLocaleString(),
      modified: oneWeekAgo.toLocaleString(),
      createdIso: oneWeekAgo.toISOString(),
      modifiedIso: oneWeekAgo.toISOString(),
      isShared: false,
      allowPublicRead: false,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
    },

    // Document files
    {
      id: 'file_014',
      name: 'proposal.txt',
      nodeType: 'file',
      displayPath: '/proposal.txt',
      displaySize: '25.7 KiB',
      sizeBytes: 26317,
      mimeType: 'text/plain',
      created: oneDayAgo.toLocaleString(),
      modified: oneDayAgo.toLocaleString(),
      createdIso: oneDayAgo.toISOString(),
      modifiedIso: oneDayAgo.toISOString(),
      isShared: false,
      allowPublicRead: false,
      allowPublicWrite: false,
      isPasswordProtected: false,
      owner: 'testuser',
    },
    {
      id: 'file_015',
      name: 'meeting_notes.txt',
      nodeType: 'file',
      displayPath: '/meeting_notes.txt',
      displaySize: '12.3 KiB',
      sizeBytes: 12595,
      mimeType: 'text/plain',
      created: oneHourAgo.toLocaleString(),
      modified: oneHourAgo.toLocaleString(),
      createdIso: oneHourAgo.toISOString(),
      modifiedIso: oneHourAgo.toISOString(),
      isShared: true,
      allowPublicRead: true,
      allowPublicWrite: true,
      isPasswordProtected: false,
      owner: 'testuser',
    },
  ];

  // Combine all children (files and folders)
  const children: FileNode[] = [...foldersList, ...filesList];

  // Return the root folder with all children
  return {
    id: 'root_folder',
    name: 'Home',
    nodeType: 'folder',
    displayPath: '/',
    displaySize: '124.7 MiB',
    sizeBytes: 130742272, // Sum of all children sizes
    mimeType: 'directory',
    created: oneMonthAgo.toLocaleString(),
    modified: now.toLocaleString(),
    createdIso: oneMonthAgo.toISOString(),
    modifiedIso: now.toISOString(),
    isShared: false,
    allowPublicRead: false,
    allowPublicWrite: false,
    isPasswordProtected: false,
    owner: 'testuser',
    children: children,
  };
};

// Create a mock folder hierarchy for testing nested structures
export const createMockFolderHierarchy = (depth = 3, childrenPerLevel = 2): FolderTreeNode[] => {
  const createChildren = (currentDepth: number, parentPath: string): FolderTreeNode[] => {
    if (currentDepth <= 0) return [];

    return Array(childrenPerLevel)
      .fill(null)
      .map((_, index) => {
        const id = `folder_${parentPath}_${index}`;
        const name = `Folder ${index}`;

        return {
          id,
          name,
          nodeType: 'folder',
          children: createChildren(currentDepth - 1, `${parentPath}_${index}`),
        };
      });
  };

  // Create the array with "Home" as the first element
  const result: FolderTreeNode[] = [
    {
      id: 'home',
      name: 'Home',
      nodeType: 'folder',
      children: createChildren(depth, 'home'),
    },
  ];

  return result;
};

/**
 * Mock folder database that maps folder IDs to their contents
 * Used for simulating folder navigation in debug mode
 */
export const mockFolderDatabase = new Map<string, FileNodeFolder>();

/**
 * Initialize the mock folder database with a complete folder hierarchy
 */
export function initializeMockFolderDatabase(): FileNodeFolder {
  // Create the root/home folder
  const homeFolder = createMockFolder();
  mockFolderDatabase.set(homeFolder.id, homeFolder);

  // For each folder in the home directory, create contents
  homeFolder.children
    .filter((item): item is FileNodeFolder => item.nodeType === 'folder')
    .forEach((folder) => {
      const folderContents = createFolderContents(folder);
      mockFolderDatabase.set(folder.id, folderContents);

      // Create a second level of folders (depth 2)
      folderContents.children
        .filter((item): item is FileNodeFolder => item.nodeType === 'folder')
        .forEach((subFolder) => {
          const subFolderContents = createFolderContents(subFolder);
          mockFolderDatabase.set(subFolder.id, subFolderContents);

          // Create a third level of folders (depth 3)
          subFolderContents.children
            .filter((item): item is FileNodeFolder => item.nodeType === 'folder')
            .forEach((subSubFolder) => {
              const subSubFolderContents = createFolderContents(subSubFolder);
              mockFolderDatabase.set(subSubFolder.id, subSubFolderContents);
            });
        });
    });

  return homeFolder;
}

/**
 * Create content for a folder based on its properties
 */
function createFolderContents(folder: FileNodeFolder): FileNodeFolder {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Create a unique list of children based on the folder's ID
  const children: FileNode[] = [];

  // Add some subfolders (2-4 folders per parent)
  const folderCount = 2 + Math.floor(Math.random() * 3); // 2-4 folders
  for (let i = 0; i < folderCount; i++) {
    const id = `${folder.id}_subfolder_${i}`;
    const name = `${folder.name} Subfolder ${i + 1}`;
    const path = `${folder.displayPath}/${name}`;

    children.push({
      id,
      name,
      nodeType: 'folder',
      displayPath: path,
      displaySize: '0 B',
      sizeBytes: 0,
      mimeType: 'directory',
      created: oneWeekAgo.toLocaleString(),
      modified: oneDayAgo.toLocaleString(),
      createdIso: oneWeekAgo.toISOString(),
      modifiedIso: oneDayAgo.toISOString(),
      isShared: Math.random() > 0.7,
      allowPublicRead: Math.random() > 0.5,
      allowPublicWrite: Math.random() > 0.8,
      isPasswordProtected: Math.random() > 0.9,
      owner: 'testuser',
      children: [], // Folders must have a children array
    });
  }

  // Add some files (3-7 files per folder)
  const fileCount = 3 + Math.floor(Math.random() * 5); // 3-7 files
  const fileTypes = [
    { mime: 'text/plain', ext: '.txt' },
    { mime: 'application/pdf', ext: '.pdf' },
    { mime: 'image/jpeg', ext: '.jpg' },
    { mime: 'image/png', ext: '.png' },
    { mime: 'application/javascript', ext: '.js' },
    { mime: 'text/css', ext: '.css' },
    { mime: 'application/json', ext: '.json' },
    { mime: 'text/markdown', ext: '.md' },
    { mime: 'video/mp4', ext: '.mp4' },
    { mime: 'audio/mpeg', ext: '.mp3' },
  ];

  for (let i = 0; i < fileCount; i++) {
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const id = `${folder.id}_file_${i}`;
    const name = `${folder.name} File ${i + 1}${fileType ? fileType.ext : ''}`;
    const path = `${folder.displayPath}/${name}`;
    const sizeBytes = Math.floor(Math.random() * 10000000); // Random size up to 10MB
    const sizeDisplay = formatFileSize(sizeBytes);

    // Create file (explicitly typed) - no children property
    const file: FileNodeFile = {
      id,
      name,
      nodeType: 'file',
      displayPath: path,
      displaySize: sizeDisplay,
      sizeBytes,
      mimeType: fileType ? fileType.mime : 'application/octet-stream',
      created: oneWeekAgo.toLocaleString(),
      modified: oneHourAgo.toLocaleString(),
      createdIso: oneWeekAgo.toISOString(),
      modifiedIso: oneHourAgo.toISOString(),
      isShared: Math.random() > 0.7,
      allowPublicRead: Math.random() > 0.5,
      allowPublicWrite: Math.random() > 0.8,
      isPasswordProtected: Math.random() > 0.9,
      owner: 'testuser',
    };

    children.push(file);
  }

  // Calculate total size of folder based on children
  const totalSize = children.reduce((sum, item) => sum + item.sizeBytes, 0);

  // Create the folder content object
  return {
    id: folder.id,
    name: folder.name,
    nodeType: 'folder',
    displayPath: folder.displayPath,
    displaySize: formatFileSize(totalSize),
    sizeBytes: totalSize,
    mimeType: 'directory',
    created: folder.created,
    modified: folder.modified,
    createdIso: folder.createdIso,
    modifiedIso: folder.modifiedIso,
    isShared: folder.isShared,
    allowPublicRead: folder.allowPublicRead,
    allowPublicWrite: folder.allowPublicWrite,
    isPasswordProtected: folder.isPasswordProtected,
    owner: folder.owner,
    children: children,
  };
}

/**
 * Format file size from bytes to human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  else if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
  else return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GiB`;
}
