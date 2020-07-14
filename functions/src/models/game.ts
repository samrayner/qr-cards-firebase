import { firestore } from 'firebase-admin';

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
        toFirestore(game: Game): firestore.DocumentData {
            return {
                uid: game.uid,
                startedAt: game.startedAt,
                turnCount: game.turnCount,
                alertLevels: game.alertLevels,
                endedAt: game.endedAt
            }
        },
        fromFirestore(data: firestore.DocumentData): Game {
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
