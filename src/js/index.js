import "../css/style.css";
import { view } from './view'
import { gameComps } from './gameComponents'


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
        gameComps.Player('Tango', gameComps.Gameboard(gameboardSize)),
        gameComps.Player('Bingo', gameComps.Gameboard(gameboardSize))
    ]
    let turnIndex = 0
    let player = players[turnIndex]
    
    
    function initialize() {
        turnIndex = 0
        player = players[turnIndex]

        view.displayPlayerView(players)
        view.displayStatusStart(deployLoop)
    }

    function deployLoop() {
        const ships = shipParams.map(params => gameComps.Ship(...params))
        
        view.displayStatusMsg(`Deploy your ships, ${player.getName()}.`)
        
        view.displayDeployView(gameboardSize, ships, player, () => {
            // add all ships to Gameboard via addShip()!!!!!!!!!!!!!

            nextTurn()

            if (turnIndex === 0) {
                view.displayBattleView(gameboardSize, players)
                battleLoop()
            }
            else {
                deployLoop()
            }
        })

        /* Add drag and drop listeners */

        addShipCellDragListeners() 
        
        const gameboardCells = Array.from(
            document.querySelectorAll('.gameboard td')
        )

        for (const cell of gameboardCells) {
            addGameboardCellDropListeners(cell, ships)
        }
    }

    function addShipCellDragListeners() {
        document.addEventListener("dragstart", function (event) {
            const draggable = event.target
            const rect = draggable.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top
            // transfer
            // 1 - id of dragged
            // 2 - position of mouse within dragged
            event.dataTransfer.setData("dragId", draggable.id)
            event.dataTransfer.setData("mouseX", x)
            event.dataTransfer.setData("mouseY", y)
        });
    }

    function addGameboardCellDropListeners(gameboardCell, ships) {
        gameboardCell.addEventListener("dragover", function (event) {
            event.preventDefault();
        });
        
        gameboardCell.addEventListener("dragenter", function (event) {
            const target = event.target;
            const classes = target.classList
        
            // If target is gameboard cell and it is not a ship cell,
            // consider dropping ship cell in target
            if (
                classes.contains("dropTarget")
                && !classes.contains('shipCellContainer')
            ) {
                classes.add('gameboardCellHover')
            }
        });
        
        gameboardCell.addEventListener("dragleave", function (event) {
            const target = event.target;
            const classes = target.classList
        
            if (
                classes.contains("dropTarget")
                && !classes.contains('shipCellContainer')
            ) {
                classes.remove('gameboardCellHover')
            }
        });
        
        gameboardCell.addEventListener("drop", function (event) {
            event.preventDefault();
            const target = event.target;
            const targetClasses = target.classList
            
            if (
                !targetClasses.contains("dropTarget")
                || targetClasses.contains('shipCellContainer')
            ) {
                return
            }

            targetClasses.remove('gameboardCellHover')

            // coords of targeted gameboard cell
            const targetCoords = target.id
                .split(':')[1].split('-')
                .map(coord => parseInt(coord))

            // shipID format is playerID:shipName-shipID
            const shipTableId = event.dataTransfer.getData("dragId");
            const shipTable = document.getElementById(shipTableId)
            const shipCells = Array.from(shipTable.querySelectorAll('div'))
            const rect = shipTable.getBoundingClientRect()

            const shipId = parseInt(shipTableId.split('-')[1])
            const [ship] = ships.filter(ship => ship.getId() === shipId)
            
            const shipyard = document.getElementById('shipyard')
            const shipIsVertical = shipyard.classList
                .contains('alignVertical')
            
            if (shipIsVertical) {
                const mouseY = event.dataTransfer.getData("mouseY");
                const height = rect.bottom - rect.top
                const shipCellSize = height / ship.getLength()
                const shipCellsBefore = Math.floor(mouseY / shipCellSize)

                // coords of gameboard cell where first ship cell will be
                const shipStartCoords = [
                    targetCoords[0]-shipCellsBefore,
                    targetCoords[1]
                ]

                if (
                    shipCellsFit(
                        shipStartCoords, 
                        (coords, i) => [coords[0]+i, coords[1]],
                        shipCells
                    )
                ) {
                    // removeShipCells(shipCells)
                    addShipCells(
                        shipStartCoords, 
                        (coords, i) => [coords[0]-i, coords[1]],
                        shipCells
                    )
                }   
            }
            else {
                const mouseX = event.dataTransfer.getData("mouseX");
                const width = rect.right - rect.left
                const shipCellSize = width / ship.getLength()
                const shipCellsBefore = Math.floor(mouseX / shipCellSize)

                // coords of gameboard cell where first ship cell will be
                const shipStartCoords = [
                    targetCoords[0],
                    targetCoords[1]-shipCellsBefore
                ]
                
                if (
                    shipCellsFit(
                        shipStartCoords, 
                        (coords, i) => [coords[0], coords[1]+i],
                        shipCells, 
                    )
                ) {
                    // removeShipCells(shipCells)
                    addShipCells(
                        shipStartCoords,  
                        (coords, i) => [coords[0], coords[1]-i],
                        shipCells
                    )
                }
            }
        });
    }

    // Parameter updateCoord arguments include coords as [row, col] 
    // and an integer, where the integer only updates row/col.
    // Parameter updateCoord returns coords as [row, col].
    function shipCellsFit(originCoords, updateCoord, shipCells) {
        return fromOriginGameboardCell(
            originCoords, 
            shipCells.length, 
            updateCoord, 
            gameboardCell => {
                return (
                    gameboardCell 
                    && !gameboardCell.classList
                        .contains('shipCellContainer')
                )
            }
        )
    }

    function removeShipCells(shipCells) {

        for (const cell of shipCells) {
            const cellContainer = cell.parentElement
            cellContainer.classList.remove('shipCellContainer')
            cellContainer.removeChild(cell)
            
            const shipTable = cellContainer.parentElement.parentElement
            shipTable.style.display = 'none'
        }
    }


    // Parameter shipCells is a list of ship cells ordered by proximity
    // to the originCoords coords (greater proximity, earlier in list)
    function addShipCells(originCoords, updateCoord, shipCells) {
        return fromOriginGameboardCell(
            originCoords, 
            shipCells.length, 
            updateCoord, 
            gameboardCell => {
                gameboardCell.classList.add('shipCellContainer')
                gameboardCell.append(shipCells[0])
                shipCells.shift()                
            }
        )
    }

    // Perform cellFunc on gameboard cells starting at originCoords
    // and extending the operation to extension cells in the direction 
    // specified by updateCoord.
    // Function cellFunc should return a boolean; if false is returned
    // when applying it to any cell, this function returns false.
    // Else, this function returns true. 
    function fromOriginGameboardCell(
        originCoords, cellCount, updateCoord, cellFunc
    ) {
        
        for (let i=0; i<cellCount; i++) {
            const [row, col] = updateCoord(originCoords, i)
            const gameboardCell = document.getElementById(
                `${player.getId()}:${row}-${col}`
            )

            if (!cellFunc(gameboardCell)) {
                return false
            }            
        }

        return true
    }

    function battleLoop() {
        view.displayStatusMsg(`It is your turn, ${player.getName()}.`)
         
        // The following is a callback for when cell selected:
        // get selected cell
        // hit selected cell
        // change color of selected cell to indicate it has been hit
        // prevent further clicks on selected cell
        // if ship and sunk, show ship in red
        // if ship, reveal that part of ship in its natural color
        // then...
        
        if (player.getGameBoard().allShipsSunk()) {
            player.win()
            view.displayStatusEnd(player, initialize)
        }
        else {
            nextTurn()
            battleLoop()
        } 
    }

    function nextTurn() {
        turnIndex = (turnIndex + 1) % players.length
        player = players[turnIndex]
    }

    return { initialize }

})()


game.initialize()