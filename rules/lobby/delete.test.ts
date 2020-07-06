import * as firebase from '@firebase/testing';

import {
  COLLECTIONS,
  generateMockLobby,
  generateUID,
  generateUserUID
} from '../../test-helpers/contants';
import {
  getAdminApp,
  Firestore,
  setup,
  teardown,
} from '../../test-helpers/firestore-helpers';

const COLLECTION = COLLECTIONS.LOBBIES;
const LOBBY_CODE = generateUID();
const USER_UID = generateUserUID();

describe('/lobbies:delete', () => {
  let db: Firestore;

  describe('when authenticated', () => {
    beforeAll(async () => {
      db = await setup(USER_UID);
    });

    afterAll(() => teardown());

    it('succeeds when deleted by creator', async () => {
      const adminDb = getAdminApp();
      await adminDb
        .collection(COLLECTIONS.LOBBIES)
        .doc(LOBBY_CODE)
        .set(generateMockLobby(USER_UID));

      const document = db.collection(COLLECTION).doc(LOBBY_CODE);
      await firebase.assertSucceeds(document.delete());
    });

    it('fails when deleted by non-creator', async () => {
      const adminDb = getAdminApp();
      await adminDb
        .collection(COLLECTIONS.LOBBIES)
        .doc(LOBBY_CODE)
        .set({ 'createdBy': '' });

      const document = db.collection(COLLECTION).doc(LOBBY_CODE);
      await firebase.assertFails(document.delete());
    });
  });

  describe('when unauthenticated', () => {
    beforeAll(async () => {
      db = await setup();
    });

    afterAll(() => teardown());

    it('fails', async () => {
      const document = db.collection(COLLECTION).doc(LOBBY_CODE);
      await firebase.assertFails(document.delete());
    });
  });
});
