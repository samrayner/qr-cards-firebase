import * as Test from 'firebase-functions-test';
Test().mockConfig({});

import {
    generateUserUID, 
    COLLECTIONS, 
    generateMockGame,
    documentPath,
} from '../../../test-helpers/contants';
import {
    getAdminApp,
    setup,
    teardown,
} from '../../../test-helpers/firestore-helpers';
import { _joinGame } from '../../src';
import { HttpsError } from 'firebase-functions/lib/providers/https';

const USER_UID = generateUserUID();

describe('joinGame', () => {
    let db: FirebaseFirestore.Firestore;
    
    beforeAll(async () => {
        await setup(USER_UID, {
            [documentPath(COLLECTIONS.GAMES, 'YYYY')]: generateMockGame('')
        });
        db = getAdminApp();
    });
    
    afterAll(() => teardown());
    
    describe('when the game exists', () => {
        it('adds the authenticated user as a player to the game', async () => {
            await _joinGame(db, USER_UID, 'YYYY');
            const gameRef = db.collection(COLLECTIONS.GAMES).doc('AAAA');
            const player = await gameRef.collection(COLLECTIONS.PLAYERS).doc(USER_UID).get();
            expect(player.exists);
        });
    });
    
    describe('when the game does not exist', () => {
        it('fails with a not found error', async () => {
            expect.assertions(1);
            try {
                await _joinGame(db, USER_UID, 'NNNN');
            } catch (e) {
                expect(e).toEqual(new HttpsError('not-found', 'Game not found.'));
            }
        });
    });
});
