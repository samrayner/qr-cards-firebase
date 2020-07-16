const admin = require('firebase-admin')

let cachedAdminApp

exports.init = () => {
  if (cachedAdminApp) {
    return
  }

  cachedAdminApp = admin.initializeApp()
}

exports.getApp = () => {
  return cachedAdminApp
}

exports.getFirestore = () => {
  return cachedAdminApp.firestore()
}
