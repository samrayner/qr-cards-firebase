import * as firebase from '@firebase/testing';

import {
  COLLECTIONS,
  generateUID,
  generateUserUID,
  generateMockUpdateDocument
} from '../../test-helpers/contants';
import {
  Firestore,
  setup,
  teardown,
} from '../../test-helpers/firestore-helpers';

const COLLECTION = COLLECTIONS.CATCH_ALL;
const DOC_UID = generateUID();
const USER_UID = generateUserUID();

describe('/catchAlls:update', () => {
  let db: Firestore;

  describe('when authenticated', () => {
    beforeAll(async () => {
      db = await setup(USER_UID);
    });

    afterAll(() => teardown());

    it('fails', async () => {
      const document = db.collection(COLLECTION).doc(DOC_UID);
      await firebase.assertFails(document.update(generateMockUpdateDocument()));
    });
  });

  describe('when unauthenticated', () => {
    beforeAll(async () => {
      db = await setup();
    });

    afterAll(() => teardown());

    it('fails', async () => {
      const document = db.collection(COLLECTION).doc(DOC_UID);
      await firebase.assertFails(document.update(generateMockUpdateDocument()));
    });
  });
});
