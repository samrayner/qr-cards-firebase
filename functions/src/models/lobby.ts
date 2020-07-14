import { firestore } from 'firebase-admin';

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
        toFirestore(lobby: Lobby): firestore.DocumentData {
            return {
                code: lobby.code,
                createdAt: lobby.createdAt,
                createdBy: lobby.createdBy,
                gameUID: lobby.gameUID
            }
        },
        fromFirestore(data: firestore.DocumentData): Lobby {
            return new Lobby(
                data.code,
                data.createdAt,
                data.createdBy,
                data.gameUID
            )
        }
    }
}
