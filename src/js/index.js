import "../css/style.css";
import { view } from './interface/view'
import { Gameboard } from './logic/gameboard'
import { Ship } from './logic/ship'
import { Player } from './logic/player'


const game = (() => {
    const gameboardSize = 10
    const shipParams = [
        ['Carrier', 5],
        ['Battleship', 4],
        ['Destroyer', 3],
        ['Submarine', 3],
        ['Patrol Boat', 2]
    ]
    const players = [
        Player('Tango', Gameboard(gameboardSize)),
        Player('Bingo', Gameboard(gameboardSize))
    ]
    let turnIndex = 0
    let player = players[turnIndex]
    
    
    function initialize(initialGame=true) {
        turnIndex = 0
        player = players[turnIndex]
        
        view.displayPlayerView(players)

        if (initialGame) {
            view.displayStatusStart(deployLoop)
        }
        else {
            for (const player of players) {
                player.setGameboard(Gameboard(gameboardSize))
            }
            deployLoop()
        }
    }

    function deployLoop() {
        const ships = shipParams.map(params => Ship(...params))
        
        view.displayStatusMsg(`Deploy your ships, ${player.getName()}.`)
        
        view.displayDeployView(ships, player, () => {
            
            for (const ship of ships) {
                if (!ship.getPosition()) {
                    view.displayStatusMsg(
                        'You must deploy your ships first,'
                        + ` ${player.getName()}.`
                    )
                    return
                }
            }

            nextTurn()

            if (turnIndex === 0) {
                view.displayBattleView(
                    players, 
                    (opponent, opponentTable) => {
                        view.deactivateGameboard(opponentTable)

                        if (opponent.getGameboard().allShipsSunk()) {
                            player.win()
                            view.displayStatusEnd(
                                player, 
                                () => initialize(false)
                            )
                        }
                        else {
                            nextTurn()
                            battleLoop()
                        }
                    }
                )
                
                battleLoop()
            }
            else {
                deployLoop()
            }
        })
    }

    function battleLoop() {
        view.displayStatusMsg(`It is your turn, ${player.getName()}.`)

        const opponentIndex = turnIndex ? 0 : 1

        const gameboards = Array.from(
            document.querySelectorAll('.gameboard')
        )
        const opponentGameboard = gameboards[opponentIndex]
        view.activateGameboard(opponentGameboard)
    }

    function nextTurn() {
        turnIndex = (turnIndex + 1) % players.length
        player = players[turnIndex]
    }

    return { initialize }

})()


game.initialize()