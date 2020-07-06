import * as firebase from '@firebase/testing';

import {
  COLLECTIONS,
  documentPath,
  generateMockLobby,
  generateUID,
  generateUserUID
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

describe('/lobbies:update', () => {
  let db: Firestore;

  describe('when authenticated', () => {
    beforeAll(async () => {
      db = await setup(USER_UID, {
        [documentPath(COLLECTION, LOBBY_CODE_1)]: generateMockLobby(USER_UID),
        [documentPath(COLLECTION, LOBBY_CODE_2)]: generateMockLobby('')
      });
    });

    afterAll(() => teardown());

    it('fails unless created by user', async () => {
      const document = db.collection(COLLECTION).doc(LOBBY_CODE_2);
      await firebase.assertFails(document.update({}));
    });

    it('succeeds if created by user', async () => {
      const document = db.collection(COLLECTION).doc(LOBBY_CODE_1);
      await firebase.assertSucceeds(document.update({}));
    });
  });

  describe('when unauthenticated', () => {
    beforeAll(async () => {
      db = await setup();
    });

    afterAll(() => teardown());

    it('fails', async () => {
      const document = db.collection(COLLECTION).doc(LOBBY_CODE_1);
      await firebase.assertFails(document.update({}));
    });
  });
});
