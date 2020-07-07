import * as functions from 'firebase-functions';

import { 
    CallableContext, 
    HttpsError 
} from 'firebase-functions/lib/providers/https';

import { getFirestore } from '../admin';
import { PlayerProfileRole } from '../models';

function generateLobbyCode(length: number) {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

async function generateUniqueLobbyCode(
    firestore: FirebaseFirestore.Firestore, 
    generator: (length: number, attempt: number) => string = generateLobbyCode,
    attempt: number = 1
): Promise<string> {
    if (attempt > 5) {
        throw new HttpsError('already-exists', 'Exceeded lobby code generation attempts (5)');
    }

    const code: string = generator(4, attempt);
    const lobby = await firestore.collection('lobbies').doc(code).get();
    
    if (lobby.exists) {
        return await generateUniqueLobbyCode(firestore, generator, attempt+1);
    } else {
        return code;
    }
}

export async function _createLobby(
    firestore: FirebaseFirestore.Firestore,
    userUID: string,
    generator: (length: number, attempt: number) => string = generateLobbyCode
): Promise<string> {
    const code: string = await generateUniqueLobbyCode(firestore, generator);
    const lobbyReference = firestore.collection('lobbies').doc(code);

    await lobbyReference.set({ 
        code: code,
        createdBy: userUID, 
        createdAt: new Date()
    });

    await lobbyReference.collection('playerProfiles').doc(userUID).set({
        uid: userUID,
        joinedAt: new Date(),
        isReady: false,
        role: PlayerProfileRole.Thief,
        turn: 0
    });

    return code;
}

export const createLobby = functions
    .region('europe-west1')
    .https
    .onCall(
        async (data: any, context: CallableContext): Promise<string> => {
            if (!context.auth) { 
                throw new HttpsError('permission-denied', 'Not authorized');
            }

            return await _createLobby(getFirestore(), context.auth.uid);
        }
    );
