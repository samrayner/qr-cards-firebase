import * as uuid from 'uuid/v4';

export enum COLLECTIONS {
  CATCH_ALL = 'catchAlls',
  GAMES = 'games',
  PLAYERS = 'players',
}

export function generateMockGame(creatorUID: string, data: Object = {}): Object {
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
  gameCode: string,
  playerUID: string
): string {
  return documentPath(COLLECTIONS.GAMES, gameCode, COLLECTIONS.PLAYERS, playerUID);
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
