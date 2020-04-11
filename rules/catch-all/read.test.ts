import * as firebase from '@firebase/testing';

import {
  COLLECTIONS,
  generateUID,
  generateUserUID,
} from '../../test-helpers/contants';
import {
  Firestore,
  setup,
  teardown,
} from '../../test-helpers/firestore-helpers';

const COLLECTION = COLLECTIONS.CATCH_ALL;
const DOC_UID = generateUID();
const USER_UID = generateUserUID();

describe('/catchAlls/read', () => {
  let db: Firestore;

  describe('authenticated', () => {
    beforeAll(async () => {
      db = await setup(USER_UID);
    });

    afterAll(() => teardown());

    test('disallow', async () => {
      const collection = db.collection(COLLECTION);
      const document = collection.doc(DOC_UID);

      await firebase.assertFails(collection.get());
      await firebase.assertFails(document.get());
    });
  });

  describe('unauthenticated', () => {
    beforeAll(async () => {
      db = await setup();
    });

    afterAll(() => teardown());

    test('disallow', async () => {
      const collection = db.collection(COLLECTION);
      const document = collection.doc(DOC_UID);

      await firebase.assertFails(collection.get());
      await firebase.assertFails(document.get());
    });
  });
});
