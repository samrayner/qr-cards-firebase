class Player {
  constructor (
    uid,
    color,
    location,
    score = 0,
    effects = [],
    qrCodePayloadsThisRound = [],
    isTakingTurn = false
  ) {
    this.uid = uid
    this.color = color
    this.location = location
    this.score = score
    this.effects = effects
    this.qrCodePayloadsThisRound = qrCodePayloadsThisRound
    this.isTakingTurn = isTakingTurn
  }

  toString () {
    return `Player ${this.uid}`
  }

  static get firestoreConverter () {
    return {
      toFirestore (player) {
        return {
          uid: player.uid,
          color: player.color,
          location: player.location,
          score: player.score,
          effects: player.effects,
          qrCodePayloadsThisRound: player.qrCodePayloadsThisRound,
          isTakingTurn: player.isTakingTurn
        }
      },
      fromFirestore (snapshot, options) {
        const data = snapshot.data(options)
        return new Player(
          data.uid,
          data.color,
          data.location,
          data.score,
          data.effects,
          data.qrCodePayloadsThisRound,
          data.isTakingTurn
        )
      }
    }
  }
}

module.exports = Player
