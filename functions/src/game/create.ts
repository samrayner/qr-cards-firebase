import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { getFirestore } from '../admin';

function generateGameCode(length: number) {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    var result = '';
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

async function generateUniqueGameCode(
    firestore: FirebaseFirestore.Firestore, 
    attempt: number = 1,
    generator: (length: number, attempt: number) => string = generateGameCode
): Promise<string> {
    if (attempt > 5) {
        throw new functions.https.HttpsError('already-exists', 'Exceeded game code generation attempts (5)');
    }

    const gameCode: string = generator(4, attempt);
    const game = await firestore.collection('games').doc(gameCode).get();
    if (game.exists) {
        return await generateUniqueGameCode(firestore, attempt+1, generator);
    } else {
        return gameCode;
    }
}

export const createGame = functions.https.onCall(async (data: any, context: CallableContext): Promise<string> => {
    const firestore = getFirestore();
    const gameCode: string = await generateUniqueGameCode(firestore);

    if (!context.auth) { 
        throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

    const userUID = context.auth?.uid;
    const gameReference = firestore.collection('games').doc(gameCode);

    await gameReference.set({ 
        createdBy: context.auth?.uid, 
        createdAt: admin.firestore.Timestamp.fromDate(new Date()) 
    });

    await gameReference.collection('players').doc(userUID).set({
        joinedAt: admin.firestore.Timestamp.fromDate(new Date())
    });

    return gameCode
});
