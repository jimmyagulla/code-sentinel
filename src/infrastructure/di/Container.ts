import { NodeFileSystemAdapter } from '../../adapters/filesystem/NodeFileSystemAdapter';
import { Sha256HashAdapter } from '../../adapters/crypto/Sha256HashAdapter';
import { VscodeConfigAdapter } from '../../adapters/config/VscodeConfigAdapter';
import { VscodeNotificationAdapter } from '../../adapters/notification/VscodeNotificationAdapter';
import { JsonFileStorageAdapter } from '../../adapters/storage/JsonFileStorageAdapter';
import { GitAdapter } from '../../adapters/scm/GitAdapter';
import type { StoragePort } from '../../application/ports/StoragePort';
import type { ScmPort } from '../../application/ports/ScmPort';
import type { FileSystemPort } from '../../application/ports/FileSystemPort';
import type { NotificationPort } from '../../application/ports/NotificationPort';
import type { ConfigPort } from '../../application/ports/ConfigPort';
import type { HashPort } from '../../application/ports/HashPort';
import { CreateNoteUseCase } from '../../application/use-cases/CreateNote';
import { UpdateNoteUseCase } from '../../application/use-cases/UpdateNote';
import { DeleteNoteUseCase } from '../../application/use-cases/DeleteNote';
import { ListNotesUseCase } from '../../application/use-cases/ListNotes';
import { MarkFileStatusUseCase } from '../../application/use-cases/MarkFileStatus';
import { ValidateFileStatusUseCase } from '../../application/use-cases/ValidateFileStatus';
import { ReconcileWorkspaceUseCase } from '../../application/use-cases/ReconcileWorkspace';
import { ReconcileFileUseCase } from '../../application/use-cases/ReconcileFile';
import { ListWorkspaceFileStatusesUseCase } from '../../application/use-cases/ListWorkspaceFileStatuses';
import { SetupWorkspaceUseCase } from '../../application/use-cases/SetupWorkspace';
import { DEFAULT_STORAGE_RELATIVE_PATH } from '../../constants/defaultStoragePath';

export class Container {
  readonly fs: FileSystemPort;
  readonly configPort: ConfigPort;
  readonly notificationPort: NotificationPort;
  readonly hash: HashPort;
  readonly storage: StoragePort;
  readonly scm: ScmPort;

  readonly createNote: CreateNoteUseCase;
  readonly updateNote: UpdateNoteUseCase;
  readonly deleteNote: DeleteNoteUseCase;
  readonly listNotes: ListNotesUseCase;
  readonly markFileStatus: MarkFileStatusUseCase;
  readonly validateFileStatus: ValidateFileStatusUseCase;
  readonly reconcileWorkspace: ReconcileWorkspaceUseCase;
  readonly reconcileFile: ReconcileFileUseCase;
  readonly listWorkspaceFileStatuses: ListWorkspaceFileStatusesUseCase;
  readonly setupWorkspace: SetupWorkspaceUseCase;

  readonly workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.fs = new NodeFileSystemAdapter();
    this.configPort = new VscodeConfigAdapter();
    this.notificationPort = new VscodeNotificationAdapter();
    this.hash = new Sha256HashAdapter();
    const storagePath =
      this.configPort.get<string>('storagePath') ?? DEFAULT_STORAGE_RELATIVE_PATH;
    const gitAdapter = new GitAdapter(workspaceRoot);
    this.scm = gitAdapter;
    this.storage = new JsonFileStorageAdapter(this.fs, workspaceRoot, storagePath);

    this.createNote = new CreateNoteUseCase(
      this.storage,
      this.scm,
      this.fs,
      this.hash,
      workspaceRoot
    );
    this.updateNote = new UpdateNoteUseCase(this.storage);
    this.deleteNote = new DeleteNoteUseCase(this.storage);
    this.listNotes = new ListNotesUseCase(this.storage);
    this.markFileStatus = new MarkFileStatusUseCase(this.storage, this.scm);
    this.validateFileStatus = new ValidateFileStatusUseCase(this.storage, this.scm);
    this.reconcileFile = new ReconcileFileUseCase(
      this.storage,
      this.scm,
      this.fs,
      this.hash,
      this.configPort,
      workspaceRoot,
      this.validateFileStatus
    );
    this.reconcileWorkspace = new ReconcileWorkspaceUseCase(
      this.storage,
      this.scm,
      this.fs,
      this.hash,
      this.configPort,
      workspaceRoot,
      this.reconcileFile,
      this.validateFileStatus
    );
    this.listWorkspaceFileStatuses = new ListWorkspaceFileStatusesUseCase(this.storage);
    this.setupWorkspace = new SetupWorkspaceUseCase(this.fs, this.notificationPort);
  }
}
