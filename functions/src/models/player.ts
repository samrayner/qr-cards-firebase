import { PlayerRole } from '../models';
import { firestore } from 'firebase-admin';

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
        toFirestore(player: Player): firestore.DocumentData {
            return {
                uid: player.uid,
                role: player.role,
                turn: player.turn,
                location: player.location,
                score: player.score
            }
        },
        fromFirestore(data: firestore.DocumentData): Player {
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
