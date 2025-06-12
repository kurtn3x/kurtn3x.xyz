const VIDEOMIME = [
  'video/ogg',
  'video/mp4',
  'video/x-matroska',
  'audio/mp4',
  'audio/mpeg',
  'audio/aac',
  'audio/x-caf',
  'audio/flac',
  'audio/ogg',
  'audio/wav',
  'application/x-mpegURL',
  'application/dash+xml',
];

const IMAGEMIME = ['image/jpeg', 'image/gif', 'image/png', 'image/svg+xml', 'image/webp'];

const CODEMIME = [
  'text/plain',
  'text/text',
  'text/code',
  'text/code-json',
  'text/code-javascript',
  'text/code-markdown',
  'text/code-python',
  'application/x-javascript',
  'text/x-python',
  'application/javascript',
  'text/html',
  'text/css',
  'text/csv',
  'application/xml',
  'application/json',
  'application/yaml',
  'text/xml',
  'application/x-sh',
  'text/markdown',
];

const PDFMIME = ['application/pdf'];
const WYSIWYGMIME = ['text/document', 'text/wysiwyg'];

interface mimeMapType {
  name: string;
  icon: string;
  type: string;
}

const mimeMap: Map<string, mimeMapType> = new Map<string, mimeMapType>();

for (const mime of VIDEOMIME) {
  mimeMap.set(mime, {
    name: 'Video',
    icon: 'movie',
    type: 'video',
  });
}
for (const mime of IMAGEMIME) {
  mimeMap.set(mime, {
    name: 'Image',
    icon: 'image',
    type: 'image',
  });
}

for (const mime of CODEMIME) {
  mimeMap.set(mime, {
    name: 'Text/Code',
    icon: 'code',
    type: 'code',
  });
}

for (const mime of PDFMIME) {
  mimeMap.set(mime, {
    name: 'PDF',
    icon: 'picture_as_pdf',
    type: 'pdf',
  });
}

for (const mime of WYSIWYGMIME) {
  mimeMap.set(mime, {
    name: 'Document',
    icon: 'article',
    type: 'wysiwyg',
  });
}

mimeMap.set('folder', {
  name: 'Folder',
  icon: 'folder',
  type: 'folder',
});

const createTypes: Map<string, mimeMapType> = new Map<string, mimeMapType>();

createTypes.set('text/wysiwyg', {
  name: 'Document',
  icon: 'article',
  type: 'wysiwyg',
});

createTypes.set('text/code', {
  name: 'Text/Code',
  icon: 'code',
  type: 'code',
});

export function getIcon(mime: string) {
  const t = mimeMap.get(mime);
  if (t == undefined) {
    return 'file_present';
  } else {
    return t.icon;
  }
}

export type MimeType = 'video' | 'image' | 'code' | 'pdf' | 'wysiwyg' | 'unknown';

export { createTypes, mimeMap };
