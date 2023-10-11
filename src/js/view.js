const view = (() => {
    const playerView = document.getElementById('playerView')
    const statusView = document.getElementById('statusView')
    statusView.classList.add('textMedium')
    
    const gameView = document.getElementById('gameView')

    function displayPlayerView(players) {
        playerView.innerHTML = ''
        
        for (const player of players) {
            const data = document.createElement('div')
            data.classList.add('playerData')
        
            const name = document.createElement('div')
            name.classList.add('textMedium')
            name.textContent = player.getName()

            const wins = document.createElement('div')
            wins.textContent = `Wins: ${player.getWins()}`
        
            data.append(name, wins)
            playerView.append(data)
        }
    }

    function displayStatusStart(onStartFunc) {
        statusView.innerHTML = ''

        const startBtn = document.createElement('button')
        startBtn.classList.add('textLarge')
        startBtn.textContent = 'Start'
        startBtn.onclick = onStartFunc

        statusView.append(startBtn)
    }

    function displayStatusEnd(winningPlayer, onEndFunc) {
        statusView.innerHTML = ''

        const p = document.createElement('p')
        p.textContent = `${winningPlayer.getName()} won the game!`

        const startBtn = document.createElement('button')
        startBtn.classList.add('textLarge')
        startBtn.textContent = 'Play Again'
        startBtn.onclick = onEndFunc

        statusView.append(p, startBtn)
    }

    function displayStatusMsg(msg) {
        statusView.innerHTML = ''

        const p = document.createElement('p')
        p.textContent = msg
        statusView.append(p)
    }

    function displayDeployView(gameboardSize, ships, player, onDoneFunc) {
        gameView.innerHTML = ''

        const gameBoard = createGameboard(gameboardSize, player)

        const shipView = document.createElement('div')
        shipView.id = 'shipView'
        const shipyard = createShipyard(ships, player)

        const buttonView = document.createElement('div')
        buttonView.id = 'shipButtonView'
        buttonView.classList.add
        
        // option to flip between vertically and horizontal aligned ships
        const flipButton = document.createElement('button')
        flipButton.textContent = 'Flip'
        flipButton.onclick = () => {
            const oldShipyard = document.getElementById('shipyard')
            const oldIsVertical = oldShipyard.classList
                .contains('alignVertical')
            
            const newShipyard = createShipyard(
                ships, player, oldIsVertical
            )
            shipView.replaceChild(newShipyard, oldShipyard)
        }
        
        const doneButton = document.createElement('button')
        doneButton.textContent = 'Done'
        doneButton.onclick = onDoneFunc

        buttonView.append(flipButton, doneButton)
        shipView.append(buttonView, shipyard)
        gameView.append(gameBoard, shipView)
    }

    function displayBattleView(gameBoardSize, players) {
        gameView.innerHTML = ''

        for (const player of players) {
            const gameboard = createGameboard(gameBoardSize, player)
            gameView.append(gameboard)
        }  
    }

    // Cells ID format is playerID:row-col
    // Gameboard ID format is playerID:gameboard
    function createGameboard(size, player) {
        const gameboard = document.createElement('table')
        gameboard.id = `${player.getId()}:gameboard`
        gameboard.classList.add('gameboard')

        const rows = size
        const cols = size
        
        const headRow = document.createElement("tr");

        // add empty col cell
        const emptyColHead = document.createElement("th");
        emptyColHead.classList.add("textLarge");
        headRow.append(emptyColHead);

        // add col index cells (code used to make letter indexes)
        let code = 65

        for (let colCount=cols; colCount>0; colCount--) {
            const colHead = document.createElement("th");
            colHead.classList.add("textLarge");
            colHead.textContent = String.fromCharCode(code);
            headRow.append(colHead);
            
            code++
        }

        gameboard.append(headRow);

        for (let i = 0; i < rows; i++) {
            const row = document.createElement("tr");

            for (let j = 0; j < cols + 1; j++) {
                let cell = null;

                if (j === 0) {
                    cell = document.createElement("th");
                    cell.classList.add("textLarge");
                    cell.textContent = `${i}`;
                } else {
                    cell = document.createElement("td");
                    cell.id = `${player.getId()}:${i}-${j - 1}`;
                    cell.classList.add("dropTarget");
                }

                row.append(cell);
            }

            gameboard.append(row);
        }

        return gameboard 
    }

    // Ship table ID format is playerID:shipName-shipID
    // Ship cell ID format is shipID:i for i in the count of cells ????????? make it playerID:shipName-shipID-i ???????????
    // Ship cell ID is applied to a div within a td element.
    function createShipyard(ships, player, horizontal=true) {
        // want to view ships in ascending length
        ships.sort((s1, s2) => s1.getLength() - s2.getLength())

        const shipyard = document.createElement('div')
        shipyard.id = 'shipyard'

        // construct ships out of table cells
        if (horizontal) {
            shipyard.classList.add('alignHorizontal')

            for (const ship of ships) {
                const shipId = ship.getId()

                const table = document.createElement('table')
                table.id = `${player.getId()}`
                    + `:${ship.getName()}`
                    + `-${ship.getId()}`
                table.classList.add('ship')
                table.draggable = true
                
                const row = document.createElement('tr')
        
                for (let i=0; i<ship.getLength(); i++) {
                    const cell = document.createElement('td')
                    cell.classList.add('shipCellContainer')

                    const shipCell = document.createElement('div')
                    shipCell.id = `${shipId}:${i}`
                    shipCell.classList.add('shipCell')
                    
                    cell.append(shipCell)
                    row.append(cell)
                }
        
                table.append(row)
                shipyard.append(table)
            }
        }
        else {
            shipyard.classList.add('alignVertical')

            for (const ship of ships) {
                const shipId = ship.getId()

                const table = document.createElement('table')
                table.id = `${player.getId()}`
                    + `:${ship.getName()}`
                    + `-${ship.getId()}`
                table.classList.add('ship')
                table.draggable = true

                for (let i=0; i<ship.getLength(); i++) {
                    const row = document.createElement('tr')
                    const cell = document.createElement('td')
                    cell.classList.add('shipCellContainer')

                    const shipCell = document.createElement('div')
                    shipCell.id = `${shipId}:${i}`
                    shipCell.classList.add('shipCell')

                    cell.append(shipCell)
                    row.append(cell)
                    table.append(row)
                }

                shipyard.append(table)
            }
        }

        return shipyard
    }

    return { 
        displayPlayerView, 
        displayStatusStart,
        displayStatusEnd,
        displayStatusMsg,
        displayBattleView,
        displayDeployView
    }

})()


export { view }