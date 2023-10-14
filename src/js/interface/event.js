function addShipDrag() {
    document.addEventListener("dragstart", function (event) {
        const draggable = event.target
        
        // this allows a ship to overlap itself when repositioning
        draggable.style.pointerEvents = 'none'

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

    document.addEventListener("dragend", function (event) {
        // re-enable ability to click and drag ship
        event.target.style.pointerEvents = 'auto'
    });
}

function addGameboardCellDrop(cell, ships, player) {
    const gameboard = player.getGameboard()

    cell.addEventListener("dragover", function (event) {
        event.preventDefault();
    });
    
    cell.addEventListener("drop", function (event) {
        event.preventDefault();
        const target = event.target;

        // shipTableID format is playerID:shipName-shipID
        const shipTableId = event.dataTransfer.getData("dragId");
        const shipTable = document.getElementById(shipTableId)
        const shipTableRect = shipTable.getBoundingClientRect()

        const shipId = parseInt(shipTableId.split('-')[1])
        const [ship] = ships.filter(ship => ship.getId() === shipId)
        
        const height = shipTableRect.bottom - shipTableRect.top
        const width = shipTableRect.right - shipTableRect.left
        const shipIsVertical = height > width
        
        if (shipIsVertical) {
            const mouseY = event.dataTransfer.getData("mouseY");
            deployShip(
                target, mouseY, shipTable, height, ship, gameboard, 0
            )
        }
        else {
            const mouseX = event.dataTransfer.getData("mouseX");
            deployShip(
                target, mouseX, shipTable, width, ship, gameboard, 1
            ) 
        }
    });
}

// Place ship on gameboard
function deployShip(
    dropTarget, mouseCoord, shipTable, shipTableLen, ship, gameboard, axis
) {
    const shipCellSize = shipTableLen / ship.getLength()
    const shipCellsBefore = Math.floor(mouseCoord / shipCellSize)

    // coords of targeted gameboard table cell
    const targetCoords = dropTarget.id
        .split(':')[1].split('-')
        .map(coord => parseInt(coord))

    // get position info on gameboard cell
    const targetRect = dropTarget.getBoundingClientRect()

    // Coords of gameboard table cell where first ship cell will be
    const startCoords = [
        targetCoords[0],
        targetCoords[1]
    ]
    startCoords[axis] -= shipCellsBefore

    const endCoords = [
        startCoords[0],
        startCoords[1]
    ]
    endCoords[axis] += ship.getLength() - 1

    // Make sure ship to add is not out of bounds and that
    // it does not overlap another ship.
    if (
        startCoords[axis] < 0
        || endCoords[axis] > gameboard.getSize() - 1
        || gameboard.shipOverlap(ship, startCoords, endCoords)
    ) {
        return
    }
    
    // remove old ship position from logic gameboard
    gameboard.removeShip(ship)
    // add new ship position to logic gameboard
    gameboard.addShip(ship, startCoords, endCoords)
    
    // Remove ship table as child from original pos.
    // If original pos is shipyard, leave placeholder
    // element to maintain shipyard shape (otherwise
    // deployed ships are displayed incorrectly).
    const parent = shipTable.parentElement
    const shipTableInShipyard = parent.id === 'shipyard'

    if (shipTableInShipyard) {
        const placeholder = shipTable.cloneNode(true)
        placeholder.id = `${shipTable.id}:clone`
        placeholder.draggable = false
        placeholder.style.visibility = 'hidden'
        parent.replaceChild(placeholder, shipTable)
    }
    else {
        shipTable.parentElement.removeChild(shipTable)
    }

    // add ship table as child to game view
    const gameView = document.getElementById('gameView')
    gameView.append(shipTable)
    const gameViewRect = gameView.getBoundingClientRect()

    shipTable.style.position = 'absolute'
    shipTable.style.left = targetRect.left - gameViewRect.left + 'px'
    shipTable.style.top = (
        targetRect.top - gameViewRect.top - shipCellSize*shipCellsBefore
    ) + 'px'
}

function addShipyardDrop(shipyard, ships, player) {
    const gameboard = player.getGameboard()
    
    shipyard.addEventListener("dragover", function (event) {
        event.preventDefault();
    });
    
    shipyard.addEventListener("drop", function (event) {
        event.preventDefault();
        const target = event.target;
        // shipTableID format is playerID:shipName-shipID
        const shipTableId = event.dataTransfer.getData("dragId");
        const shipTable = document.getElementById(shipTableId)
        
        // if ship has not been deployed, do nothing
        if (target.contains(shipTable)) {
            return
        }

        const shipId = parseInt(shipTableId.split('-')[1])
        const [ship] = ships.filter(ship => ship.getId() === shipId)
        
        withdrawShip(shipTable, ship, gameboard)
    });
}

// remove ship from gameboard
function withdrawShip(shipTable, ship, gameboard) {
    // remove old ship position from logic gameboard
    gameboard.removeShip(ship)
    // remove shipTable element
    shipTable.parentElement.removeChild(shipTable)
    // let clone be new shipTable
    const placeholder = document.getElementById(`${shipTable.id}:clone`)
    placeholder.id = shipTable.id
    placeholder.draggable = true
    placeholder.style.visibility = 'visible'
    placeholder.style.pointerEvents = 'auto'
}

function addDynamicShipPositioning(ships, player) {
    
    window.onresize = function () {

        for (const ship of ships) {

            // if ship is not yet deployed
            if (ship.getPosition() === null) {
                continue
            }

            const [startRow, startCol] = ship.getPosition()[0]
            
            // get gameboard table cell that corresponds to startCoords
            const tableCell = document.getElementById(
                `${player.getId()}:${startRow}-${startCol}`
            )
            const tableCellRect = tableCell.getBoundingClientRect()
            const gameView = document.getElementById('gameView')
            const gameViewRect = gameView.getBoundingClientRect()

            // Position shipTable of ship at gameboard table cell's 
            // top and left.
            const shipTable = document.getElementById(
                `${player.getId()}:${ship.getName()}-${ship.getId()}`
            )
            shipTable.style.left = (
                tableCellRect.left - gameViewRect.left + 'px'
            )
            shipTable.style.top = (
                tableCellRect.top - gameViewRect.top + 'px'
            )
        }
    }
}

function addGameboardCellHit(cell, player, onTurnEnd) {
    const gameboard = player.getGameboard()
    
    cell.addEventListener("click", function hit() {
        // handle logic gameboard cell that corresponds to table cell
        const coords = cell.id
            .split(':')[1]
            .split('-')
            .map(coord => parseInt(coord))
        
        // ship is either a ship occupying the coords or null
        const ship = gameboard.receiveAttack(coords)
        
        if (ship && ship.isSunk()) {
            const [startCoords, endCoords] = ship.getPosition()
            const rowDiff = endCoords[0] - startCoords[0]
            const colDiff = endCoords[1] - startCoords[1]
            const rowShift = (rowDiff / Math.abs(rowDiff)) || 0
            const colShift = (colDiff / Math.abs(colDiff)) || 0

            let coords = startCoords
            
            for (let i=0; i<ship.getLength(); i++) {
                const currCell = document.getElementById(
                    `${player.getId()}:${coords[0]}-${coords[1]}`
                )
                currCell.classList.remove('hit')
                currCell.classList.add('sunk')
                coords = [
                    coords[0] + rowShift, 
                    coords[1] + colShift
                ]  
            }
        }
        else if (ship) {
            cell.classList.add('hit')
        }
        else {
            cell.classList.add('mishit')
        }
    
        cell.removeEventListener('click', hit)

        const gameboardTable = cell.parentElement.parentElement

        onTurnEnd(player, gameboardTable)
    })
}


export { 
    addShipDrag, 
    addGameboardCellDrop, 
    addShipyardDrop,
    addDynamicShipPositioning,
    addGameboardCellHit
}