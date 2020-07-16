class Player {
  constructor (
    uid,
    role,
    turn,
    location,
    score
  ) {
    this.uid = uid
    this.role = role
    this.turn = turn
    this.location = location
    this.score = score
  }

  toString () {
    return `Player ${this.uid}`
  }

  static get firestoreConverter () {
    return {
      toFirestore (player) {
        return {
          uid: player.uid,
          role: player.role,
          turn: player.turn,
          location: player.location,
          score: player.score
        }
      },
      fromFirestore (data) {
        return new Player(
          data.uid,
          data.role,
          data.turn,
          data.location,
          data.score
        )
      }
    }
  }
}

module.exports = Player
