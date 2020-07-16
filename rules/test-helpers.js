const firebase = require('@firebase/testing')
const fs = require('fs')
const { v4: uuid } = require('uuid')

const PROJECT_ID = 'firestore-emulator-example'
const COVERAGE_URL = `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}:ruleCoverage.html`

exports.getAuthedFirestore = (auth) => {
  return firebase
    .initializeTestApp({ projectId: PROJECT_ID, auth })
    .firestore()
}

exports.getAdminFirestore = () => {
  return firebase
    .initializeAdminApp({ projectId: PROJECT_ID })
    .firestore()
}

exports.clearFirestore = async () => {
  await firebase.clearFirestoreData({ projectId: PROJECT_ID })
}

exports.loadRules = async () => {
  const rules = fs.readFileSync('rules/firestore.rules', 'utf8')
  await firebase.loadFirestoreRules({ projectId: PROJECT_ID, rules })
}

exports.deleteApps = async () => {
  // Delete all the FirebaseApp instances created during testing
  // Note: this does not affect or clear any data
  await Promise.all(firebase.apps().map((app) => app.delete()))
  console.log(`View rule coverage information at ${COVERAGE_URL}\n`)
}

exports.path = (...parts) => {
  return parts.join('/')
}

exports.generateUID = ({
  append = '',
  prepend = ''
} = {}) => {
  let id = uuid()

  if (prepend) {
    id = `${prepend}-${id}`
  }

  if (append) {
    id += `-${append}`
  }

  return id
}
