import type {
  AccountSettings,
  FileNode,
  HeaderInfo,
  User,
  UserProfile,
  VPNClient,
  VPNConnection,
} from './apiTypes';

/**
 * Simple test data generators that return a single instance of each type
 */

export function getTestHeaderInfo(): HeaderInfo {
  return {
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    username: 'testuser',
    isAdmin: true,
  };
}

export function getTestUser(): User {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    email: 'testuser@example.com',
    isAdmin: true,
  };
}

export function getTestUserProfile(): UserProfile {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    name: 'Test User',
    status: 'Online',
    location: 'Test City',
    description: 'This is a test user profile for development and testing',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    role: 'Developer',
    dateJoined: '2023-01-01',
  };
}

export function getTestAccountSettings(): AccountSettings {
  return {
    account: getTestUser(),
    profile: getTestUserProfile(),
  };
}

export function getTestFileNode(): FileNode {
  return {
    id: 'file-001',
    name: 'test-document.pdf',
    nodeType: 'file',
    displayPath: '/Documents/test-document.pdf',
    displaySize: '2.5 MB',
    sizeBytes: 2621440,
    mimeType: 'application/pdf',
    created: '2023-06-15, 14:30:00',
    modified: '2023-06-20, 09:15:30',
    createdIso: '2023-06-15T14:30:00Z',
    modifiedIso: '2023-06-20T09:15:30Z',
    isShared: false,
    allowPublicRead: false,
    allowPublicWrite: false,
    isPasswordProtected: false,
    owner: 'testuser',
  };
}

export function getTestFolderNode(): FileNode {
  return {
    id: 'folder-001',
    name: 'Documents',
    nodeType: 'folder',
    displayPath: '/Documents',
    displaySize: '10.2 MB',
    sizeBytes: 10695680,
    mimeType: 'directory',
    created: '2023-05-10, 08:00:00',
    modified: '2023-06-22, 16:45:20',
    createdIso: '2023-05-10T08:00:00Z',
    modifiedIso: '2023-06-22T16:45:20Z',
    isShared: false,
    allowPublicRead: false,
    allowPublicWrite: false,
    isPasswordProtected: false,
    owner: 'testuser',
    children: [getTestFileNode()],
  };
}

export function getTestVpnConnection(): VPNConnection {
  return {
    name: 'Test Connection',
    addresses: '10.0.0.2/24',
    clientPublicKey: 'mRgQrwX3WLH2IUXNz6tsIqf/60ygQs4hcqfsFvNfLnU=',
    allowedIps: '0.0.0.0/0, ::/0',
    serverPublicKey: 'KALxO/+UYwqFPUGFI+WbUbIJ8MOwKgemi9oYBdr4OVo=',
    presharedKey: '',
    dnsServers: '1.1.1.1, 8.8.8.8',
    allowedIpsInternal: '10.0.0.0/24',
    endpoint: 'vpn.example.com:51820',
  };
}

export function getTestVpnClients(): VPNClient[] {
  return [
    {
      id: 'vpn-001',
      name: 'Laptop',
      addresses: '10.0.0.2/24',
      clientPublicKey: 'abc123publickey==',
      created: '2023-01-15',
      alternativeRoute: false,
      state: 'CREATED',
    },
    {
      id: 'vpn-002',
      name: 'Smartphone',
      addresses: '10.0.0.3/24',
      clientPublicKey: 'def456publickey==',
      created: '2023-02-20',
      alternativeRoute: true,
      state: 'PROCESSING',
    },
    {
      id: 'vpn-003',
      name: 'Tablet',
      addresses: '10.0.0.4/24',
      clientPublicKey: 'ghi789publickey==',
      created: '2023-03-25',
      alternativeRoute: false,
      state: 'FAILED',
    },
    {
      id: 'vpn-004',
      name: 'Work PC',
      addresses: '10.0.0.5/24',
      clientPublicKey: 'jkl012publickey==',
      created: '2023-04-10',
      alternativeRoute: true,
      state: 'NEW',
    },
    {
      id: 'vpn-005',
      name: 'Home Server',
      addresses: '10.0.0.6/24',
      clientPublicKey: 'mno345publickey==',
      created: '2023-05-05',
      alternativeRoute: false,
      state: 'DELETING',
    },
  ];
}
