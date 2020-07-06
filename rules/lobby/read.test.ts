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

const COLLECTION = COLLECTIONS.LOBBIES;
const LOBBY_CODE_1 = generateUID();
const LOBBY_CODE_2 = generateUID();
const USER_UID = generateUserUID();

describe('/lobbies:read', () => {
  let db: Firestore;

  describe('when authenticated', () => {
    beforeAll(async () => {
      db = await setup(USER_UID, {
        [playerPath(LOBBY_CODE_1, USER_UID)]: { name: '' },
        [playerPath(LOBBY_CODE_2, generateUserUID())]: { name: '' }
      });
    });

    afterAll(() => teardown());

    it('fails if not in lobby', async () => {
      const collection = db.collection(COLLECTION);
      const document = collection.doc(LOBBY_CODE_2);

      await firebase.assertFails(collection.get());
      await firebase.assertFails(document.get());
    });

    it('fails for lobbies that do not exist', async () => {
      const collection = db.collection(COLLECTION);
      const document = collection.doc(generateUID());

      await firebase.assertFails(collection.get());
      await firebase.assertFails(document.get());
    });

    it('succeeds for a player in the lobby', async () => {
      const collection = db.collection(COLLECTION);
      const document = collection.doc(LOBBY_CODE_1);

      await firebase.assertFails(collection.get());
      await firebase.assertSucceeds(document.get());
    });
  });

  describe('when unauthenticated', () => {
    beforeAll(async () => {
      db = await setup();
    });

    afterAll(() => teardown());

    it('fails', async () => {
      const collection = db.collection(COLLECTION);
      const document = collection.doc(LOBBY_CODE_1);

      await firebase.assertFails(collection.get());
      await firebase.assertFails(document.get());
    });
  });
});
