import * as firebase from '@firebase/testing';

import {
  COLLECTIONS,
  generateUID,
  generateUserUID,
  playerPath,
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

describe('/games/read', () => {
  let db: Firestore;

  describe('authenticated', () => {
    beforeAll(async () => {
      db = await setup(USER_UID, {
        [playerPath(GAME_CODE_1, USER_UID)]: { name: '' },
        [playerPath(GAME_CODE_2, generateUserUID())]: { name: '' }
      });
    });

    afterAll(() => teardown());

    test('disallow if not in game', async () => {
      const collection = db.collection(COLLECTION);
      const document = collection.doc(GAME_CODE_2);

      await firebase.assertFails(collection.get());
      await firebase.assertFails(document.get());
    });

    test('disallow on games that don\'t exist', async () => {
      const collection = db.collection(COLLECTION);
      const document = collection.doc(generateUID());

      await firebase.assertFails(collection.get());
      await firebase.assertFails(document.get());
    });

    test('allow for a player in the game', async () => {
      const collection = db.collection(COLLECTION);
      const document = collection.doc(GAME_CODE_1);

      await firebase.assertFails(collection.get());
      await firebase.assertSucceeds(document.get());
    });
  });

  describe('unauthenticated', () => {
    beforeAll(async () => {
      db = await setup();
    });

    afterAll(() => teardown());

    test('disallow', async () => {
      const collection = db.collection(COLLECTION);
      const document = collection.doc(GAME_CODE_1);

      await firebase.assertFails(collection.get());
      await firebase.assertFails(document.get());
    });
  });
});
