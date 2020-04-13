import {
    generateUserUID, 
    COLLECTIONS, 
    generateMockGame,
} from '../../../test-helpers/contants';
import {
    Firestore,
    getAdminApp,
    setup,
    teardown,
} from '../../../test-helpers/firestore-helpers';
import { _createGame } from '../../src';
import { HttpsError } from 'firebase-functions/lib/providers/https';

const USER_UID = generateUserUID();

describe('createGame', () => {
    let db: Firestore;
    
    beforeAll(async () => {
        await setup(USER_UID);
        db = getAdminApp();
    });
    
    afterAll(() => teardown());
    
    describe('when no games exist', () => {
        it('creates a new game with a unique code and the user as a player', async () => {
            const gameCode = await _createGame(db, USER_UID);
            const gameRef = db.collection(COLLECTIONS.GAMES).doc(gameCode);
            const game = await gameRef.get();
            const player = await gameRef.collection(COLLECTIONS.PLAYERS).doc(USER_UID).get();
            
            expect(game.get('createdBy')).toEqual(USER_UID);
            expect(player.exists);
        });
    });
    
    describe('when the first game code exists', () => {
        function codeGenerator(length: number, attempt: number): string {
            return attempt === 1 ? 'AAAA' : 'BBBB';
        }
        
        beforeAll(async () => {
            await db.collection(COLLECTIONS.GAMES).doc('AAAA').set(generateMockGame(''));
        });
        
        it('creates a new game with a unique code', async () => {
            const gameCode = await _createGame(db, USER_UID, codeGenerator);
            const game = await db.collection(COLLECTIONS.GAMES).doc(gameCode).get();
            expect(gameCode).toEqual('BBBB');
            expect(game.exists);
        });
    });
    
    describe('when the first 5 game codes exist', () => {
        function codeGenerator(length: number, attempt: number): string {
            return 'CCCC'
        }
        
        beforeAll(async () => {
            await db.collection(COLLECTIONS.GAMES).doc('CCCC').set(generateMockGame(''));
        });
        
        it('fails with an error', async () => {
            expect.assertions(1);
            try {
                await _createGame(db, USER_UID, codeGenerator);
            } catch (e) {
                expect(e).toEqual(new HttpsError('already-exists', 'Exceeded game code generation attempts (5)'));
            }
        });
    });
});
