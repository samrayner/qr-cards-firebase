import * as firebase from '@firebase/testing';

export type Firestore = FirebaseFirestore.Firestore;

let testIncrement = 0;
let useRealProjectID = false;
const projectIdBase = `firestore-emulator-${Date.now()}`;

function adjustTestIncrement() {
  testIncrement += 1;
}

function getProjectId() {
  return `${projectIdBase}:${testIncrement}`;
}

function generateProjectID(): string {
  return useRealProjectID ? 'qrcards-ae72c' : getProjectId();
}

export function setUseRealProjectId() {
  useRealProjectID = true;
}

export function getAdminApp(): Firestore {
  const adminApp = firebase.initializeAdminApp({
    projectId: generateProjectID(),
  });

  return (adminApp.firestore() as any) as Firestore;
}

export function getAuthedApp(userUID?: string): Firestore {
  const app = firebase.initializeTestApp({
    auth: userUID ? { uid: userUID } : undefined,
    projectId: generateProjectID(),
  });

  return (app.firestore() as any) as Firestore;
}

export async function setup(
  userUID?: string,
  data: any = {}
): Promise<Firestore> {
  adjustTestIncrement();
  const db = getAuthedApp(userUID);

  if (!data || !Object.keys(data).length) {
    return db;
  }

  const adminDb = getAdminApp();
  const batch = adminDb.batch();

  Object.entries(data).forEach(([key, value]) => {
    batch.set(adminDb.doc(key), value as any);
  });

  await batch.commit();
  return db;
}

export async function teardown() {
  useRealProjectID = false;
  return Promise.all(firebase.apps().map(app => app.delete()));
}
