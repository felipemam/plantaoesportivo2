import { Article } from '../data/portalData';
import { formatArticleForDriveMarkdown } from '../utils/validation';
import { getAccessToken } from './firebase';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  size?: string;
  iconLink?: string;
}

async function requireToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }
  return token;
}

export async function listDriveFiles(searchQuery?: string): Promise<DriveFileItem[]> {
  const accessToken = await requireToken();

  const qParts = ['trashed = false'];
  if (searchQuery && searchQuery.trim()) {
    const escaped = searchQuery.trim().replace(/'/g, "\\'");
    qParts.push(`name contains '${escaped}'`);
  }

  const params = new URLSearchParams({
    pageSize: '25',
    orderBy: 'modifiedTime desc',
    q: qParts.join(' and '),
    fields: 'files(id,name,mimeType,modifiedTime,webViewLink,size,iconLink)'
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('AUTH_REQUIRED');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erro ao listar arquivos do Google Drive: ${errText}`);
  }

  const data = await res.json();
  return (data.files || []) as DriveFileItem[];
}

export async function createDriveDocument(params: {
  name: string;
  content: string;
  targetMimeType: 'text/markdown' | 'application/vnd.google-apps.document';
  contentMimeType?: string;
}): Promise<DriveFileItem> {
  const accessToken = await requireToken();

  const metadata = {
    name: params.name,
    mimeType: params.targetMimeType,
    description: 'Arquivo exportado pelo portal Plantão Esportivo'
  };

  const boundary = 'plantao_esportivo_drive_boundary';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;
  const bodyContentMime = params.contentMimeType || 'text/plain; charset=UTF-8';

  const multipartBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${bodyContentMime}\r\n\r\n` +
    params.content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error('AUTH_REQUIRED');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Falha ao criar arquivo no Google Drive: ${errText}`);
  }

  return (await res.json()) as DriveFileItem;
}

export async function exportArticleToDrive(
  article: Article,
  format: 'markdown' | 'gdoc' = 'gdoc'
): Promise<DriveFileItem> {
  const markdown = formatArticleForDriveMarkdown(article);
  const isGDoc = format === 'gdoc';
  const fileName = isGDoc
    ? `[Plantão Esportivo] ${article.title}`
    : `plantao-${article.id}.md`;

  return createDriveDocument({
    name: fileName,
    content: markdown,
    targetMimeType: isGDoc
      ? 'application/vnd.google-apps.document'
      : 'text/markdown',
    contentMimeType: 'text/plain; charset=UTF-8'
  });
}

export async function exportReadingListToDrive(articles: Article[]): Promise<DriveFileItem> {
  const dateStr = new Date().toLocaleDateString('pt-BR');
  const sections = articles.map((a, idx) => {
    return `## ${idx + 1}. ${a.title}\nCategoria: ${a.category} | Autor: ${a.author.name} | Leitura: ${a.readTime}\n\n${a.dek}\n\n${a.leadParagraph}\n`;
  });

  const content = [
    `# Caderno de Leitura — Plantão Esportivo (${dateStr})`,
    `Total de matérias salvas: ${articles.length}`,
    `---`,
    ``,
    ...sections
  ].join('\n');

  return createDriveDocument({
    name: `[Plantão Esportivo] Caderno de Leitura (${dateStr})`,
    content,
    targetMimeType: 'application/vnd.google-apps.document',
    contentMimeType: 'text/plain; charset=UTF-8'
  });
}

export async function readDriveFileText(
  fileId: string,
  mimeType: string
): Promise<string> {
  const accessToken = await requireToken();

  let url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`;
  if (mimeType === 'application/vnd.google-apps.document') {
    url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export?mimeType=text/plain`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('AUTH_REQUIRED');
  }

  if (!res.ok) {
    throw new Error('Não foi possível ler o conteúdo textual deste arquivo.');
  }

  return await res.text();
}

export async function updateDriveFileContent(
  fileId: string,
  newContent: string
): Promise<DriveFileItem> {
  const accessToken = await requireToken();

  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=media&fields=id,name,mimeType,modifiedTime,webViewLink`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain; charset=UTF-8'
      },
      body: newContent
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error('AUTH_REQUIRED');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erro ao atualizar arquivo no Google Drive: ${errText}`);
  }

  return (await res.json()) as DriveFileItem;
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const accessToken = await requireToken();

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error('AUTH_REQUIRED');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erro ao excluir arquivo do Google Drive: ${errText}`);
  }
}
