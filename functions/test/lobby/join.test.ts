import * as Test from 'firebase-functions-test';
Test().mockConfig({});

import {
    generateUserUID, 
    COLLECTIONS, 
    generateMockLobby,
    documentPath,
} from '../../../test-helpers/contants';
import {
    getAdminApp,
    setup,
    teardown,
} from '../../../test-helpers/firestore-helpers';
import { _joinLobby } from '../../src';
import { HttpsError } from 'firebase-functions/lib/providers/https';

const USER_UID = generateUserUID();

describe('joinLobby', () => {
    let db: FirebaseFirestore.Firestore;
    
    beforeAll(async () => {
        await setup(USER_UID, {
            [documentPath(COLLECTIONS.LOBBIES, 'YYYY')]: generateMockLobby('')
        });
        db = getAdminApp();
    });
    
    afterAll(() => teardown());
    
    describe('when the lobby exists', () => {
        it('adds the authenticated user as a player to the lobby', async () => {
            await _joinLobby(db, USER_UID, 'YYYY');
            const lobbyRef = db.collection(COLLECTIONS.LOBBIES).doc('AAAA');
            const player = await lobbyRef.collection(COLLECTIONS.PLAYER_PROFILES).doc(USER_UID).get();
            expect(player.exists);
        });
    });
    
    describe('when the lobby does not exist', () => {
        it('fails with a not found error', async () => {
            expect.assertions(1);
            try {
                await _joinLobby(db, USER_UID, 'NNNN');
            } catch (e) {
                expect(e).toEqual(new HttpsError('not-found', 'Lobby not found.'));
            }
        });
    });
});
