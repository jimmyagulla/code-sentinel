export interface NoteDto {
  id: string;
  filePath: string;
  anchor: {
    startLine: number;
    endLine: number;
    contentHash: string;
    snippet: string;
  };
  content: string;
  priority: string;
  type: string;
  scope: string;
  status: string;
  author: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
}
