import axios from 'axios';
import { useFileOperationsStore } from 'src/stores/fileStores/fileOperationsStore';
import { generateUniqueUploadId } from 'src/components/lib/functions';
import type {
  AnyTrackerNode,
  ChunkedUploadProgressEntry,
  FileTrackerNode,
  FolderTrackerNode,
  FolderUploadProgressEntry,
  RegularUploadProgressEntry,
} from 'src/types/localTypes';
import { isFileTrackerNode, isFolderTrackerNode, UploadStatus } from 'src/types/localTypes';

const CHUNKED_UPLOAD_THRESHOLD = 50 * 1024 * 1024; // 50MB
const activeTrackingIntervals = new Set<NodeJS.Timeout>();

export function useFolderUpload() {
  const fileOps = useFileOperationsStore();

  /**
   * Initialize the folder structure for upload
   * @param upload The folder upload entry containing the root directory
   * @returns Promise resolving to true if successful, false otherwise
   */
  async function initializeStructure(upload: FolderUploadProgressEntry): Promise<boolean> {
    try {
      console.log(`[DEBUG] Creating root node for: ${upload.name}`);
      const rootNode: FolderTrackerNode = {
        localId: generateUniqueUploadId(),
        remoteId: null,
        name: upload.name,
        type: 'folder',
        created: false,
        parentLocalId: null,
        content: upload.content,
        depth: 0,
      };

      const allNodes: AnyTrackerNode[] = [rootNode];

      // Don't call createFlatStructure with the root directory itself
      // Instead, read its contents and process each child
      const directoryEntry = upload.content;

      // Read the root directory contents
      const entries = await new Promise<FileSystemEntry[]>((resolve, reject) => {
        const reader = directoryEntry.createReader();
        const allEntries: FileSystemEntry[] = [];

        function readEntries() {
          reader.readEntries((entries) => {
            if (entries.length === 0) {
              resolve(allEntries);
            } else {
              allEntries.push(...entries);
              readEntries();
            }
          }, reject);
        }

        readEntries();
      });

      // Process each child entry individually (not the root directory itself)
      for (const childEntry of entries) {
        console.log(`[DEBUG] Processing child of root: ${childEntry.name}`);
        const childNodes = await createFlatStructure(childEntry, rootNode.localId, 1);
        allNodes.push(...childNodes);
      }

      upload.nodes = allNodes;
      return true;
    } catch (error) {
      console.error('Failed to initialize folder structure:', error);
      return false;
    }
  }

  /**
   * Initialize the folder structure by creating folders in the correct order
   * @param upload The folder upload entry containing the nodes to create
   * @returns Promise resolving to true if successful, false otherwise
   */
  async function initializeFolders(upload: FolderUploadProgressEntry): Promise<boolean> {
    if (!upload.nodes) {
      console.error('No nodes found in upload');
      return false;
    }

    try {
      // Filter only folder nodes and sort by depth
      const folderNodes = upload.nodes
        .filter(isFolderTrackerNode) // Type-safe filtering
        .sort((a, b) => a.depth - b.depth);

      if (folderNodes.length === 0) {
        console.log('No folders to create');
        return true;
      }

      console.log(`Creating ${folderNodes.length} folders...`);
      // Create folders in order
      for (const folderNode of folderNodes) {
        try {
          let parentId: string;

          if (folderNode.parentLocalId === null) {
            parentId = upload.parentId;
          } else {
            const parentNode = upload.nodes.find(
              (node): node is FolderTrackerNode =>
                isFolderTrackerNode(node) && node.localId === folderNode.parentLocalId,
            );

            if (!parentNode || !parentNode.remoteId) {
              console.error(
                `Parent node not found or not created yet for folder: ${folderNode.name}`,
              );
              return false;
            }
            parentId = parentNode.remoteId;
          }

          const result = await fileOps.createFolder(folderNode.name, parentId);

          if (result.successful && result.data?.id) {
            folderNode.created = true;
            folderNode.remoteId = result.data.id;
            console.log(
              `Created folder: ${folderNode.name} (ID: ${result.data.id}, Depth: ${folderNode.depth})`,
            );
          } else {
            console.error(`Failed to create folder: ${folderNode.name}`, result);
            return false;
          }
        } catch (error) {
          console.error(`Error creating folder ${folderNode.name}:`, error);
          return false;
        }
      }

      console.log(`Successfully created ${folderNodes.length} folders`);
      return true;
    } catch (error) {
      console.error('Failed to create folders:', error);
      return false;
    }
  }

  /**
   * Assign remote parent IDs to nodes based on their parentLocalId
   * @param upload The folder upload entry containing the nodes
   * @returns true if successful, false otherwise
   */
  function assignRemoteParentIds(upload: FolderUploadProgressEntry): boolean {
    if (!upload.nodes) {
      console.error('No nodes found in upload');
      return false;
    }

    try {
      for (const node of upload.nodes) {
        if (node.parentLocalId === null) {
          // Add parentRemoteId property if it doesn't exist
          (node as any).parentRemoteId = upload.parentId;
        } else {
          const parentNode = upload.nodes.find((n) => n.localId === node.parentLocalId);

          if (!parentNode) {
            console.error(`Parent node not found for node: ${node.name}`);
            return false;
          }

          if (isFolderTrackerNode(parentNode) && !parentNode.remoteId) {
            console.error(`Parent folder not created yet for node: ${node.name}`);
            return false;
          }

          // Type-safe assignment based on parent type
          if (isFolderTrackerNode(parentNode)) {
            (node as any).parentRemoteId = parentNode.remoteId!;
          }
        }
      }

      console.log(`Successfully assigned remote parent IDs to ${upload.nodes.length} nodes`);
      return true;
    } catch (error) {
      console.error('Failed to assign remote parent IDs:', error);
      return false;
    }
  }

  async function createFlatStructure(
    entry: FileSystemEntry,
    parentLocalId: string | null = null,
    depth: number = 0,
  ): Promise<AnyTrackerNode[]> {
    const nodes: AnyTrackerNode[] = [];

    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      const file = await new Promise<File>((resolve, reject) => {
        fileEntry.file(resolve, reject);
      });

      const fileNode: FileTrackerNode = {
        localId: generateUniqueUploadId(),
        name: entry.name,
        type: 'file',
        created: false,
        parentLocalId,
        content: file,
        depth,
      };

      nodes.push(fileNode);
    } else if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry;
      const folderNode: FolderTrackerNode = {
        localId: generateUniqueUploadId(),
        remoteId: null,
        name: entry.name,
        type: 'folder',
        created: false,
        parentLocalId,
        content: dirEntry,
        depth,
      };

      nodes.push(folderNode);

      // Read directory contents
      const entries = await new Promise<FileSystemEntry[]>((resolve, reject) => {
        const reader = dirEntry.createReader();
        const allEntries: FileSystemEntry[] = [];

        function readEntries() {
          reader.readEntries((entries) => {
            if (entries.length === 0) {
              resolve(allEntries);
            } else {
              allEntries.push(...entries);
              readEntries();
            }
          }, reject);
        }

        readEntries();
      });

      console.log(
        `[DEBUG] Directory ${entry.name} contains ${entries.length} entries:`,
        entries.map((e) => e.name),
      );

      // Recursively process all entries with incremented depth
      for (const childEntry of entries) {
        const childNodes = await createFlatStructure(childEntry, folderNode.localId, depth + 1);
        nodes.push(...childNodes);
      }
    }

    return nodes;
  }

  /**
   * Create upload entries for all file nodes
   */
  function createFileUploadEntries(
    upload: FolderUploadProgressEntry,
  ): (RegularUploadProgressEntry | ChunkedUploadProgressEntry)[] {
    if (!upload.nodes) return [];

    const fileNodes = upload.nodes.filter(isFileTrackerNode);
    const uploadEntries: (RegularUploadProgressEntry | ChunkedUploadProgressEntry)[] = [];

    for (const fileNode of fileNodes) {
      const uploadId = generateUniqueUploadId();
      const file = fileNode.content;
      const parentRemoteId = (fileNode as any).parentRemoteId as string;

      if (file.size >= CHUNKED_UPLOAD_THRESHOLD) {
        const chunkedEntry: ChunkedUploadProgressEntry = {
          id: uploadId,
          name: fileNode.name,
          parentId: parentRemoteId,
          type: 'file',
          content: file,
          mimeType: file.type,
          sizeBytes: file.size,
          status: UploadStatus.QUEUED,
          message: 'Queued for upload...',
          uploadedBytes: 0,
          uploadSpeed: 0,
          chunks: [],
        };
        uploadEntries.push(chunkedEntry);
      } else {
        const regularEntry: RegularUploadProgressEntry = {
          id: uploadId,
          name: fileNode.name,
          parentId: parentRemoteId,
          type: 'file',
          content: file,
          mimeType: file.type,
          sizeBytes: file.size,
          status: UploadStatus.QUEUED,
          message: 'Queued for upload...',
          uploadedBytes: 0,
          uploadSpeed: 0,
          cancelToken: axios.CancelToken.source(),
        };
        uploadEntries.push(regularEntry);
      }

      // Map the file node to its upload entry
      upload.nodeProgressTypeMap.set(fileNode.localId, uploadEntries[uploadEntries.length - 1]!);
    }

    return uploadEntries;
  }

  interface FolderTrackingCallbacks {
    onProgress?: (completed: number, total: number, failed: number, canceled: number) => void;
    onComplete?: (
      completed: number,
      total: number,
      failed: number,
      canceled: number,
    ) => Promise<void> | void;
  }

  function trackFolderCompletion(
    folderUpload: FolderUploadProgressEntry,
    callbacks: FolderTrackingCallbacks = {},
  ): void {
    let checkInterval = 1000; // Start with 1 second
    const maxInterval = 5000; // Max 5 seconds

    function checkProgress() {
      // Stop tracking if folder is no longer uploading
      if (![UploadStatus.UPLOADING, UploadStatus.PREPARING].includes(folderUpload.status)) {
        return;
      }

      const fileUploads = Array.from(folderUpload.nodeProgressTypeMap.values());

      if (fileUploads.length === 0) {
        return;
      }

      const completedUploads = fileUploads.filter(
        (upload) => upload.status === UploadStatus.COMPLETED,
      );
      const failedUploads = fileUploads.filter((upload) => upload.status === UploadStatus.FAILED);
      const canceledUploads = fileUploads.filter(
        (upload) => upload.status === UploadStatus.CANCELED,
      );

      const totalFiles = fileUploads.length;
      const finishedFiles = completedUploads.length + failedUploads.length + canceledUploads.length;

      // Call progress callback
      if (callbacks.onProgress) {
        callbacks.onProgress(
          completedUploads.length,
          totalFiles,
          failedUploads.length,
          canceledUploads.length,
        );
      }

      // Check if all files are finished
      if (finishedFiles === totalFiles) {
        // Clean up file references before calling completion callback
        cleanupFolderFileReferences(folderUpload);

        // Call completion callback
        if (callbacks.onComplete) {
          const result = callbacks.onComplete(
            completedUploads.length,
            totalFiles,
            failedUploads.length,
            canceledUploads.length,
          );

          // Handle async completion callback
          if (result instanceof Promise) {
            result.catch(console.error);
          }
        }
        return; // Stop tracking
      }

      // Adaptive interval - check less frequently as upload progresses
      const progress = completedUploads.length / totalFiles;
      if (progress > 0.8) {
        checkInterval = Math.min(checkInterval * 1.1, maxInterval);
      }

      // Schedule next check
      const timeoutId = setTimeout(checkProgress, checkInterval);
      activeTrackingIntervals.add(timeoutId);
    }

    // Start tracking
    const initialTimeoutId = setTimeout(checkProgress, checkInterval);
    activeTrackingIntervals.add(initialTimeoutId);
  }

  /**
   * Clean up file references to free memory
   */
  function cleanupFolderFileReferences(folderUpload: FolderUploadProgressEntry): void {
    console.log(`[DEBUG] Cleaning up file references for folder: ${folderUpload.name}`);

    // Clear file references from nodes
    folderUpload.nodes.forEach((node) => {
      if (isFileTrackerNode(node)) {
        // Clear the File object reference
        (node as any).content = null;
      } else if (isFolderTrackerNode(node)) {
        // Clear the FileSystemDirectoryEntry reference
        (node as any).content = null;
      }
    });

    // Clear file references from upload entries
    folderUpload.nodeProgressTypeMap.forEach((uploadEntry) => {
      // Clear the File object reference
      (uploadEntry as any).content = null;
    });

    // Clear the root directory reference
    (folderUpload as any).content = null;

    console.log(`[DEBUG] File references cleared for folder: ${folderUpload.name}`);
  }

  return {
    initializeStructure,
    trackFolderCompletion,
    initializeFolders,
    assignRemoteParentIds,
    createFileUploadEntries,
  };
}

export function cleanupAllFolderTracking() {
  activeTrackingIntervals.forEach((intervalId) => {
    clearTimeout(intervalId);
  });
  activeTrackingIntervals.clear();
}
