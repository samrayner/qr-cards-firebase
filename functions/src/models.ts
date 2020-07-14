export interface JoinLobbyRequest {
    code: string;
}

export interface LeaveLobbyRequest {
    code: string;
}

export enum PlayerRole {
    Thief,
    Detective
}

export class Lobby {
    code: string;
    createdAt: Date;
    createdBy: string;
    gameUID?: string;

    constructor (
        code: string, 
        createdAt: Date, 
        createdBy: string, 
        gameUID?: string
    ) {
        this.code = code;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.gameUID = gameUID;
    }

    toString(): string {
        return `Lobby ${this.code}`;
    }

    public static readonly firestoreConverter = {
        toFirestore(lobby: Lobby): firebase.firestore.DocumentData {
            return {
                code: lobby.code,
                createdAt: lobby.createdAt,
                createdBy: lobby.createdBy,
                gameUID: lobby.gameUID
            }
        },
        fromFirestore(data: firebase.firestore.DocumentData): Lobby {
            return new Lobby(
                data.code,
                data.createdAt,
                data.createdBy,
                data.gameUID
            )
        }
    }
}

export class PlayerProfile {
    uid: string;
    joinedAt: Date;
    isReady: boolean;
    role?: PlayerRole;

    constructor (
        uid: string,
        joinedAt: Date,
        isReady: boolean,
        role?: PlayerRole
    ) {
        this.uid = uid
        this.joinedAt = joinedAt
        this.isReady = isReady
        this.role = role
    }

    toString(): string {
        return `PlayerProfile ${this.uid}`;
    }

    public static readonly firestoreConverter = {
        toFirestore(playerProfile: PlayerProfile): firebase.firestore.DocumentData {
            return {
                uid: playerProfile.uid,
                joinedAt: playerProfile.joinedAt,
                isReady: playerProfile.isReady,
                role: playerProfile.role
            }
        },
        fromFirestore(data: firebase.firestore.DocumentData): PlayerProfile {
            return new PlayerProfile(
                data.uid,
                data.joinedAt,
                data.isReady,
                data.role
            )
        }
    }
}

export class Player {
    uid: string;
    role: PlayerRole;
    turn: number;
    location: number;
    score: number;

    constructor (
        uid: string,
        role: PlayerRole,
        turn: number,
        location: number,
        score: number
    ) {
        this.uid = uid
        this.role = role
        this.turn = turn
        this.location = location
        this.score = score
    }

    toString(): string {
        return `Player ${this.uid}`;
    }

    public static readonly firestoreConverter = {
        toFirestore(player: Player): firebase.firestore.DocumentData {
            return {
                uid: player.uid,
                role: player.role,
                turn: player.turn,
                location: player.location,
                score: player.score
            }
        },
        fromFirestore(data: firebase.firestore.DocumentData): Player {
            return new Player(
                data.uid,
                data.role,
                data.turn,
                data.location,
                data.score
            )
        }
    }
}

export class Game {
    uid: string;
    startedAt: Date;
    turnCount: number;
    alertLevels: Map<number, number>;
    endedAt?: Date;

    constructor (
        uid: string,
        startedAt: Date,
        turnCount: number,
        alertLevels: Map<number, number>,
        endedAt?: Date
    ) {
        this.uid = uid
        this.startedAt = startedAt
        this.turnCount = turnCount
        this.alertLevels = alertLevels
        this.endedAt = endedAt
    }

    toString(): string {
        return `Game ${this.uid}`;
    }

    public static readonly firestoreConverter = {
        toFirestore(game: Game): firebase.firestore.DocumentData {
            return {
                uid: game.uid,
                startedAt: game.startedAt,
                turnCount: game.turnCount,
                alertLevels: game.alertLevels,
                endedAt: game.endedAt
            }
        },
        fromFirestore(data: firebase.firestore.DocumentData): Game {
            return new Game(
                data.uid,
                data.startedAt,
                data.turnCount,
                data.alertLevels,
                data.endedAt
            )
        }
    }
}
