import * as firebase from '@firebase/testing';

import {
  COLLECTIONS,
  documentPath,
  generateMockGame,
  generateUID,
  generateUserUID
} from '../../test-helpers/contants';
import {
  Firestore,
  setup,
  teardown,
} from '../../test-helpers/firestore-helpers';

const COLLECTION = COLLECTIONS.GAMES;
const GAME_CODE_1 = generateUID();
const GAME_CODE_2 = generateUID();
const USER_UID = generateUserUID();

describe('/games/update', () => {
  let db: Firestore;

  describe('authenticated', () => {
    beforeAll(async () => {
      db = await setup(USER_UID, {
        [documentPath(COLLECTION, GAME_CODE_1)]: generateMockGame(USER_UID),
        [documentPath(COLLECTION, GAME_CODE_2)]: generateMockGame('')
      });
    });

    afterAll(() => teardown());

    test('disallow unless created by user', async () => {
      const document = db.collection(COLLECTION).doc(GAME_CODE_2);
      await firebase.assertFails(document.update({}));
    });

    test('allow if created by user', async () => {
      const document = db.collection(COLLECTION).doc(GAME_CODE_1);
      await firebase.assertSucceeds(document.update({}));
    });
  });

  describe('unauthenticated', () => {
    beforeAll(async () => {
      db = await setup();
    });

    afterAll(() => teardown());

    test('disallow', async () => {
      const document = db.collection(COLLECTION).doc(GAME_CODE_1);
      await firebase.assertFails(document.update({}));
    });
  });
});
