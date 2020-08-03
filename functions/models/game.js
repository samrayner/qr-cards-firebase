class Game {
  constructor (
    uid,
    startedAt,
    turnOrder = [],
    turnCount = 0,
    endedAt = null
  ) {
    this.uid = uid
    this.startedAt = startedAt
    this.turnOrder = turnOrder
    this.turnCount = turnCount
    this.endedAt = endedAt
  }

  toString () {
    return `Game ${this.uid}`
  }

  static get firestoreConverter () {
    return {
      toFirestore (game) {
        return {
          uid: game.uid,
          startedAt: game.startedAt,
          turnOrder: game.turnOrder,
          turnCount: game.turnCount,
          endedAt: game.endedAt
        }
      },
      fromFirestore (snapshot, options) {
        const data = snapshot.data(options)
        return new Game(
          data.uid,
          data.startedAt,
          data.turnOrder,
          data.turnCount,
          data.endedAt
        )
      }
    }
  }
}

module.exports = Game
