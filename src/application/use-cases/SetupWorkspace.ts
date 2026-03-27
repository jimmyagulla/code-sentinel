import type { FileSystemPort } from '../ports/FileSystemPort';
import type { NotificationPort } from '../ports/NotificationPort';

export type SetupWorkspaceMode = 'commit' | 'ignore';

export interface SetupWorkspaceInput {
  mode: SetupWorkspaceMode;
  workspaceRoot: string;
  storageRelative: string;
}

export class SetupWorkspaceUseCase {
  constructor(
    private readonly fs: FileSystemPort,
    private readonly notifications: NotificationPort
  ) {}

  async execute(input: SetupWorkspaceInput): Promise<void> {
    const root = this.fs.joinPaths(input.workspaceRoot, input.storageRelative);
    await this.fs.mkdir(root, true);
    await this.fs.mkdir(this.fs.joinPaths(root, 'notes'), true);

    const gitignorePath = this.fs.joinPaths(input.workspaceRoot, '.gitignore');
    if (input.mode === 'ignore') {
      let content = '';
      if (await this.fs.exists(gitignorePath)) {
        content = await this.fs.readFile(gitignorePath);
      }
      const line = `${input.storageRelative}/`;
      if (
        !content.split(/\r?\n/).some((l) => l.trim() === line || l.trim() === input.storageRelative)
      ) {
        const append = content.endsWith('\n') || content.length === 0 ? '' : '\n';
        await this.fs.writeFileAtomic(gitignorePath, `${content}${append}${line}\n`);
      }
      this.notifications.info(`Added ${line} to .gitignore`);
    } else {
      this.notifications.info(
        `Remember to commit the ${input.storageRelative} folder to share with your team.`
      );
    }
  }
}
