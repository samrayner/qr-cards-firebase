import { v4 as uuid } from 'uuid';

export enum COLLECTIONS {
  CATCH_ALL = 'catchAlls',
  LOBBIES = 'lobbies',
  PLAYERS = 'players',
}

export function generateMockLobby(creatorUID: string, data: Object = {}): Object {
  return { createdBy: creatorUID, ...data };
}

export function generateMockDocument(data: Object = {}): Object {
  return { name: 'document name', ...data };
}

export function generateMockUpdateDocument(data: Object = {}): Object {
  return { name: 'updated document name', ...data };
}

export function documentPath(...parts: string[]): string {
  return parts.join('/');
}

export function playerPath(
  lobbyCode: string,
  playerUID: string
): string {
  return documentPath(COLLECTIONS.LOBBIES, lobbyCode, COLLECTIONS.PLAYERS, playerUID);
}

export function generateUID({
  append = '',
  prepend = '',
}: {
  append?: string;
  prepend?: string;
} = {}): string {
  let id = uuid();

  if (prepend) {
    id = `${prepend}-${id}`;
  }

  if (append) {
    id += `-${append}`;
  }

  return id;
}

export function generateUserUID(): string {
  return generateUID({ prepend: 'USER' });
}
