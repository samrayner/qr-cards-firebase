import * as functions from 'firebase-functions';

import { 
    CallableContext, 
    HttpsError 
} from 'firebase-functions/lib/providers/https';

import { getFirestore } from '../admin';
import { PlayerProfile, Lobby } from '../models';

function generateLobbyCode(length: number) {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

interface LobbyDocument {
    code: string;
    reference: FirebaseFirestore.DocumentReference<Lobby>
}

async function createLobbyDocument(
    firestore: FirebaseFirestore.Firestore, 
    userUID: string,
    generator: (length: number, attempt: number) => string = generateLobbyCode,
    attempt: number = 1
): Promise<LobbyDocument> {
    if (attempt > 5) {
        throw new HttpsError('already-exists', 'Exceeded lobby code generation attempts (5)');
    }

    const code: string = generator(4, attempt);

    const lobbyReference = firestore
        .collection('lobbies')
        .withConverter(Lobby.firestoreConverter)
        .doc(code);

    try {
        await lobbyReference.create(
            new Lobby(
                code,
                new Date(),
                userUID
            )
        );
    } catch(error) {
        return await createLobbyDocument(firestore, userUID, generator, attempt+1);
    }

    return {
        code: code,
        reference: lobbyReference
    };
}

export async function _createLobby(
    firestore: FirebaseFirestore.Firestore,
    userUID: string,
    generator: (length: number, attempt: number) => string = generateLobbyCode
): Promise<string> {
    const lobbyDocument = await createLobbyDocument(firestore, userUID, generator);

    await lobbyDocument
        .reference
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

    return lobbyDocument.code;
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
