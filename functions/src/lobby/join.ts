import * as functions from 'firebase-functions';

import { 
    CallableContext, 
    HttpsError 
} from 'firebase-functions/lib/providers/https';

import { getFirestore } from '../admin';
import {
    JoinLobbyRequest,
    Lobby,
    PlayerProfile
} from '../models';

export async function _joinLobby(
    firestore: FirebaseFirestore.Firestore,
    userUID: string,
    code: string
): Promise<void> {
    const lobbyReference = firestore
        .collection('lobbies')
        .withConverter(Lobby.firestoreConverter)
        .doc(code);

    const lobby = await lobbyReference.get();

    if (!lobby.exists) {
        throw new HttpsError('not-found', 'Lobby not found.');
    }

    if (lobby.data()?.gameUID !== undefined) {
        throw new HttpsError('deadline-exceeded', 'Game has started.');
    }

    await lobbyReference
        .collection('playerProfiles')
        .withConverter(PlayerProfile.firestoreConverter)
        .doc(userUID)
        .set(
            new PlayerProfile(
                userUID,
                new Date(),
                false
            )
        )
}

export const joinLobby = functions
    .region('europe-west1')
    .https
    .onCall(
        async (data: any, context: CallableContext): Promise<void> => {
            if (!context.auth) { 
                throw new HttpsError('permission-denied', 'Not authorized');
            }

            const request: JoinLobbyRequest = JSON.parse(data);

            await _joinLobby(getFirestore(), context.auth.uid, request.code);
        }
    );
