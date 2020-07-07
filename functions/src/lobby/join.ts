import * as functions from 'firebase-functions';

import { 
    CallableContext, 
    HttpsError 
} from 'firebase-functions/lib/providers/https';

import { getFirestore } from '../admin';

export async function _joinLobby(
    firestore: FirebaseFirestore.Firestore,
    userUID: string,
    code: string
): Promise<void> {
    const lobbyReference = firestore.collection('lobbies').doc(code);
    const lobby = await lobbyReference.get();

    if (!lobby.exists) {
        throw new HttpsError('not-found', 'Lobby not found.');
    }

    await lobbyReference.collection('players').doc(userUID).set({
        joinedAt: new Date()
    });
}

export const joinLobby = functions
    .region('europe-west1')
    .https
    .onCall(
        async (data: any, context: CallableContext): Promise<void> => {
            if (!context.auth) { 
                throw new HttpsError('permission-denied', 'Not authorized');
            }

            await _joinLobby(getFirestore(), context.auth.uid, JSON.parse(data).code);
        }
    );
