import { firestore } from 'firebase-functions';
import { getFirestore } from '../admin';
import { HttpsError } from 'firebase-functions/lib/providers/https';
import { PlayerProfile, Game, Player, PlayerRole } from '../models';
import { v4 as uuid } from 'uuid';

export const createGame = firestore
    .document('lobbies/{lobbyCode}/playerProfiles/{playerUID}')
    .onUpdate(
        async (change, context): Promise<void> => {
            const db = getFirestore();

            if (!context.auth) { 
                throw new HttpsError('permission-denied', 'Not authorized');
            }

            const lobbyCode = context.params.lobbyCode;

            const playerProfilesReference = db
                .collection(`lobbies/${lobbyCode}/playerProfiles`)
                .withConverter(PlayerProfile.firestoreConverter)

            const readyPlayersWithRole = await playerProfilesReference
                .where('role', 'in', [0,1])
                .where('isReady', '==', true)
                .get();

            if (readyPlayersWithRole.size !== 2) { return }

            const gameUID = uuid();

            const gameReference = db
                .collection('games')
                .withConverter(Game.firestoreConverter)
                .doc(gameUID)

            //create the game
            try {
                await gameReference
                    .create(
                        new Game(
                            gameUID,
                            new Date(),
                            0,
                            new Map()
                        )
                    )
            } catch (error) {
                return
            }

            const batch = db.batch()

            const gamePlayerUIDs = Array<string>()

            //add the ready players to the game
            readyPlayersWithRole.forEach(
                function(playerProfile) {
                    const profile = playerProfile.data()

                    gamePlayerUIDs.push(profile.uid)

                    const playerReference = gameReference
                        .collection('players')
                        .withConverter(Player.firestoreConverter)
                        .doc(profile.uid)
                    
                    batch
                        .set(
                            playerReference,
                            new Player(
                                profile.uid,
                                profile.role!,
                                profile.role === PlayerRole.Thief ? 0 : 1,
                                0,
                                0
                            )
                        )
                }
            );

            const allProfiles = await playerProfilesReference.get()

            //remove all excess players from lobby
            allProfiles
                .forEach(
                    function(playerProfile) {
                        const profile = playerProfile.data()

                        if (gamePlayerUIDs.includes(profile.uid)) { return }

                        batch.delete(playerProfilesReference.doc(profile.uid))
                    }
                );

            //link the lobby to the created game
            const lobbyReference = db
                .collection('lobbies')
                .doc(lobbyCode);

            await batch.update(
                lobbyReference,
                { gameUID: gameUID }
            )

            await batch.commit()
        }
    );
