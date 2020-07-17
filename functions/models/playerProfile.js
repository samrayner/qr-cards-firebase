class PlayerProfile {
  constructor (
    uid,
    joinedAt,
    isReady,
    role
  ) {
    this.uid = uid
    this.joinedAt = joinedAt
    this.isReady = isReady
    this.role = role
  }

  toString () {
    return `PlayerProfile ${this.uid}`
  }

  static get firestoreConverter () {
    return {
      toFirestore (playerProfile) {
        return {
          uid: playerProfile.uid,
          joinedAt: playerProfile.joinedAt,
          isReady: playerProfile.isReady,
          role: playerProfile.role
        }
      },
      fromFirestore (snapshot, options) {
        const data = snapshot.data(options)
        return new PlayerProfile(
          data.uid,
          data.joinedAt,
          data.isReady,
          data.role
        )
      }
    }
  }
}

module.exports = PlayerProfile
