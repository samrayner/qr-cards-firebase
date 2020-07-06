import * as firebase from '@firebase/testing';

import {
  COLLECTIONS,
  generateMockLobby,
  generateUID,
  generateUserUID,
} from '../../test-helpers/contants';
import {
  Firestore,
  setup,
  teardown,
} from '../../test-helpers/firestore-helpers';

const COLLECTION = COLLECTIONS.LOBBIES;
const LOBBY_CODE = generateUID();
const USER_UID = generateUserUID();

describe('/lobbies:create', () => {
  let db: Firestore;

  describe('when authenticated', () => {
    beforeAll(async () => {
      db = await setup(USER_UID);
    });

    afterAll(() => teardown());

    it('succeeds', async () => {
      const document = db.collection(COLLECTION).doc(LOBBY_CODE);
      await firebase.assertSucceeds(document.set(generateMockLobby(USER_UID)));
    });
  });

  describe('when unauthenticated', () => {
    beforeAll(async () => {
      db = await setup();
    });

    afterAll(() => teardown());

    it('fails', async () => {
      const document = db.collection(COLLECTION).doc(LOBBY_CODE);
      await firebase.assertFails(document.set(generateMockLobby(USER_UID)));
    });
  });
});
