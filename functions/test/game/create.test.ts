import {
  generateUserUID,
} from '../../../test-helpers/contants';
import {
  //Firestore,
  //getAdminApp,
  setup,
  teardown,
} from '../../../test-helpers/firestore-helpers';
import { createGame } from '../../src';
import * as functionsTest from 'firebase-functions-test';
import { HttpsError } from 'firebase-functions/lib/providers/https';
//import { HttpsError } from 'firebase-functions/lib/providers/https';

const USER_UID = generateUserUID();

describe('createGame', () => {
  //let db: Firestore;

  describe('when authenticated', () => {
    beforeAll(async () => {
      await setup(USER_UID);
      //db = getAdminApp();
    });

    afterAll(() => teardown());

    describe('when no games exist', () => {
      it('creates a new game with a unique code and the user as a player', async () => {
        expect(false).toBeTruthy()
      });
    });

    describe('when the first game code exists', () => {
      it('creates a new game with a unique code and the user as a player', async () => {
        expect(false).toBeTruthy()
      });
    });

    describe('when the first 5 game codes exist', () => {
      it('fails with an error', async () => {
        expect(false).toBeTruthy()
      });
    });
  });

  describe('when unauthenticated', () => {
    it('fails with a permission error', async () => {
      expect.assertions(1);
      try {
        await functionsTest().wrap(createGame)('');
      } catch (e) {
        expect(e).toEqual(new HttpsError('permission-denied', 'Not authorized'));
      }
    });
  });
});
