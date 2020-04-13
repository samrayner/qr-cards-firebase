import * as functions from 'firebase-functions';
import { CallableContext, HttpsError } from 'firebase-functions/lib/providers/https';
import { getFirestore } from '../admin';

export async function _joinGame(
    firestore: FirebaseFirestore.Firestore,
    userUID: string,
    gameCode: string
): Promise<void> {
    const gameRef = firestore.collection('games').doc(gameCode);
    const game = await gameRef.get();

    if (!game.exists) {
        throw new HttpsError('not-found', 'Game not found.');
    }

    await gameRef.collection('players').doc(userUID).set({
        joinedAt: new Date()
    });
}

export const joinGame = functions.https.onCall(async (data: any, context: CallableContext): Promise<void> => {
    if (!context.auth) { 
        throw new HttpsError('permission-denied', 'Not authorized');
    }

    await _joinGame(getFirestore(), context.auth.uid, data.stringify());
});
