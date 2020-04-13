import * as functions from 'firebase-functions';
import { CallableContext, HttpsError } from 'firebase-functions/lib/providers/https';
import { getFirestore } from '../admin';

function generateGameCode(length: number) {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

async function generateUniqueGameCode(
    firestore: FirebaseFirestore.Firestore, 
    generator: (length: number, attempt: number) => string = generateGameCode,
    attempt: number = 1
): Promise<string> {
    if (attempt > 5) {
        throw new HttpsError('already-exists', 'Exceeded game code generation attempts (5)');
    }

    const gameCode: string = generator(4, attempt);
    const game = await firestore.collection('games').doc(gameCode).get();
    
    if (game.exists) {
        return await generateUniqueGameCode(firestore, generator, attempt+1);
    } else {
        return gameCode;
    }
}

export async function _createGame(
    firestore: FirebaseFirestore.Firestore,
    userUID: string,
    generator: (length: number, attempt: number) => string = generateGameCode
): Promise<string> {
    const gameCode: string = await generateUniqueGameCode(firestore, generator);
    const gameReference = firestore.collection('games').doc(gameCode);

    await gameReference.set({ 
        createdBy: userUID, 
        createdAt: new Date()
    });

    await gameReference.collection('players').doc(userUID).set({
        joinedAt: new Date()
    });

    return gameCode;
}

export const createGame = functions.https.onCall(async (data: any, context: CallableContext): Promise<string> => {
    if (!context.auth) { 
        throw new HttpsError('permission-denied', 'Not authorized');
    }

    return await _createGame(getFirestore(), context.auth.uid);
});
