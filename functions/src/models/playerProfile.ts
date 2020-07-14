import { PlayerRole } from '../models';
import { firestore } from 'firebase-admin';

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
        toFirestore(playerProfile: PlayerProfile): firestore.DocumentData {
            return {
                uid: playerProfile.uid,
                joinedAt: playerProfile.joinedAt,
                isReady: playerProfile.isReady,
                role: playerProfile.role
            }
        },
        fromFirestore(data: firestore.DocumentData): PlayerProfile {
            return new PlayerProfile(
                data.uid,
                data.joinedAt,
                data.isReady,
                data.role
            )
        }
    }
}
