import * as firebase from '@firebase/testing';

import {
  COLLECTIONS,
  generateMockGame,
  generateUID,
  generateUserUID,
} from '../../test-helpers/contants';
import {
  Firestore,
  setup,
  teardown,
} from '../../test-helpers/firestore-helpers';

const COLLECTION = COLLECTIONS.GAMES;
const GAME_CODE = generateUID();
const USER_UID = generateUserUID();

describe('/games/create', () => {
  let db: Firestore;

  describe('authenticated', () => {
    beforeAll(async () => {
      db = await setup(USER_UID);
    });

    afterAll(() => teardown());

    test('authenticated', async () => {
      const document = db.collection(COLLECTION).doc(GAME_CODE);
      await firebase.assertSucceeds(document.set(generateMockGame(USER_UID)));
    });
  });

  describe('unauthenticated', () => {
    beforeAll(async () => {
      db = await setup();
    });

    afterAll(() => teardown());

    test('disallow', async () => {
      const document = db.collection(COLLECTION).doc(GAME_CODE);
      await firebase.assertFails(document.set(generateMockGame(USER_UID)));
    });
  });
});
