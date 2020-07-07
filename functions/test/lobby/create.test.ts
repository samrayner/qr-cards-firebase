import * as Test from 'firebase-functions-test';
Test().mockConfig({});

import {
    generateUserUID, 
    COLLECTIONS, 
    generateMockLobby,
} from '../../../test-helpers/contants';

import {
    getAdminApp,
    setup,
    teardown,
} from '../../../test-helpers/firestore-helpers';

import { _createLobby } from '../../src';

import { HttpsError } from 'firebase-functions/lib/providers/https';

const USER_UID = generateUserUID();

describe('createLobby', () => {
    let db: FirebaseFirestore.Firestore;
    
    beforeAll(async () => {
        await setup(USER_UID);
        db = getAdminApp();
    });
    
    afterAll(() => teardown());
    
    describe('when no lobbies exist', () => {
        it('creates a new lobby with a unique code and the user as a player', async () => {
            const lobbyCode = await _createLobby(db, USER_UID);
            const lobbyRef = db.collection(COLLECTIONS.LOBBIES).doc(lobbyCode);
            const lobby = await lobbyRef.get();
            const player = await lobbyRef.collection(COLLECTIONS.PLAYER_PROFILES).doc(USER_UID).get();
            
            expect(lobby.get('createdBy')).toEqual(USER_UID);
            expect(player.exists);
        });
    });
    
    describe('when the first lobby code exists', () => {
        function codeGenerator(length: number, attempt: number): string {
            return attempt === 1 ? 'AAAA' : 'BBBB';
        }
        
        beforeAll(async () => {
            await db.collection(COLLECTIONS.LOBBIES).doc('AAAA').set(generateMockLobby(''));
        });
        
        it('creates a new lobby with a unique code', async () => {
            const lobbyCode = await _createLobby(db, USER_UID, codeGenerator);
            const lobby = await db.collection(COLLECTIONS.LOBBIES).doc(lobbyCode).get();
            expect(lobbyCode).toEqual('BBBB');
            expect(lobby.exists);
        });
    });
    
    describe('when the first 5 lobby codes exist', () => {
        function codeGenerator(length: number, attempt: number): string {
            return 'CCCC'
        }
        
        beforeAll(async () => {
            await db.collection(COLLECTIONS.LOBBIES).doc('CCCC').set(generateMockLobby(''));
        });
        
        it('fails with an error', async () => {
            expect.assertions(1);
            try {
                await _createLobby(db, USER_UID, codeGenerator);
            } catch (e) {
                expect(e).toEqual(new HttpsError('already-exists', 'Exceeded lobby code generation attempts (5)'));
            }
        });
    });
});
