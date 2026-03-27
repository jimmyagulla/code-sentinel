import type { FilePath } from '../../domain/value-objects/FilePath';
import type { FileStatusValue } from '../../domain/value-objects/FileStatusValue';
import type { StoragePort } from '../ports/StoragePort';

export interface ListWorkspaceFileStatusesOutput {
  entries: { filePath: FilePath; status: FileStatusValue }[];
}

/**
 * Returns persisted file health status for every file that has CodeSentinel sidecar data.
 */
export class ListWorkspaceFileStatusesUseCase {
  constructor(private readonly storage: StoragePort) {}

  async execute(): Promise<ListWorkspaceFileStatusesOutput> {
    const files = await this.storage.listNoteFiles();
    const entries: { filePath: FilePath; status: FileStatusValue }[] = [];
    for (const fp of files) {
      const data = await this.storage.loadNotes(fp);
      if (!data) continue;
      entries.push({ filePath: fp, status: data.fileStatus.status });
    }
    return { entries };
  }
}
