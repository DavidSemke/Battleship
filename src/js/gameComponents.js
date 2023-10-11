import { getRandomInt } from './random'


const gameComps = (() => {
    function Gameboard(size=10) {
        const _size = size
        const _cells = createCells()
        const _ships = []
        let _sunkShipCount = 0
        // once active, a board can no longer add ships
        let _active = false

        function Cell() {
            let _ship = null
            let _hit = false

            function hit() {

                if (_hit) {
                    throw new Error('Cell hit twice.')
                }

                _hit = true

                if (_ship) {
                    _ship.hit()
                }
            }

            function getHit() {
                return _hit
            }

            function getShip() {
                return _ship
            }

            function setShip(ship) {
                if (_ship) {  
                    throw new Error(`Cell is already occupied.`)
                }
                if (ship.getType() !== 'ship') {
                    throw new TypeError()
                }

                _ship = ship
            }

            return {hit, getHit, getShip, setShip}
        }

        function createCells() {
            const cells = []

            for (let i=0; i<_size; i++) {
                const row = []

                for (let j=0; j<_size; j++) {
                    row.push(Cell())
                }

                cells.push(row)
            }

            return cells
        }

        // coords have format [row, col]
        function addShip(ship, startCoords, endCoords) {

            if (_active) {
                throw new Error(
                    'Tried to add ship to board after first attack.'
                )
            }

            if (_ships.includes(ship)) {
                throw new Error('Tried to add same ship twice.')
            }
            
            if (!shipFitsCoords(ship, startCoords, endCoords)) {
                throw new Error(
                    `Ship of length ${ship.getLength()} cannot fit into`
                    + ` coord range [${startCoords}, ${endCoords}]`
                    + ` vertically or horizontally.`
                )
            }

            let [startRow, startCol] = startCoords
            let [endRow, endCol] = endCoords

            if (startCol > endCol || startRow > endRow) {
                [startRow, startCol] = endCoords
                [endRow, endCol] = startCoords
            }

            if (startCol === endCol) {
                let col = startCol

                for (let row=startRow; row<endRow+1; row++) {
                    _cells[row][col].setShip(ship)
                }
            }
            else {
                let row = startRow

                for (let col=startCol; col<endCol+1; col++) {
                    _cells[row][col].setShip(ship)
                }
            }

            _ships.push(ship)
        }

        function shipFitsCoords(ship, startCoords, endCoords) {
            const [startRow, startCol] = startCoords
            const [endRow, endCol] = endCoords

            if (startRow === endRow) {
                return Math.abs(startCol - endCol) + 1 === ship.getLength()
            }
            else if (startCol === endCol) {
                return Math.abs(startRow - endRow) + 1 === ship.getLength()
            }
            
            return false
        }

        function receiveAttack(coords) {
            _active = true
            
            const [row, col] = coords
            const cell = _cells[row][col]
            cell.hit()

            const ship = cell.getShip()

            if (ship && ship.isSunk()) {
                _sunkShipCount++
            }
        }

        function allShipsSunk() {
            return _sunkShipCount === _ships.length
        }

        function randomUnhitCoords() {
            let originRow = getRandomInt(_size)
            let originCol = getRandomInt(_size)

            const shifts = [[1, -1], [-1, -1], [1, 1], [-1, 1]]
            const shift = shifts[getRandomInt(shifts.length)]

            let row = originRow
            let col = originCol

            // Game will have to end after all cells are hit, so 
            // this function should always find an unhit cell
            while (_cells[row][col].getHit()) {
                row += shift[0]
                
                if (row === _size || row === -1) {
                    row = (row + _size) % _size
                    col += shift[1]

                    if (col === _size || col === -1) {
                        col = (col + _size) % _size
                    }
                }

                if (row === originRow && col === originCol) {
                    return null
                }
            }

            return [row, col]
        }

        // Finds all vertical/horizontal [start, end] coord pairs 
        // that can accommodate the input length and returns one 
        // randomly
        function randomEmptyStraightLine(length) {
            if (length > _size || length < 2) {
                throw new RangeError(
                    `Length has range [2, ${_size}].`
                )
            }

            const verticals = emptyVerticalLines(length)
            const horizontals = emptyHorizontalLines(length)
            const lines = [...verticals, ...horizontals]

            if (!lines.length) {
                return null
            }

            return lines[getRandomInt(lines.length)]
            
            // return lines[0]
        }

        function emptyVerticalLines(length) {
            const lines = []
            let row = 0
            let col = 0

            while (col < _size) {

                if (row + length > _size) {
                    // skip to end of row to quicken leap to next row
                    row = _size - 1
                }
                else {
                    let nonemptyIndex = null

                    for (let i=0; i<length; i++) {
                        // No break, since index after nonempty index
                        // could also be nonempty
                        if (_cells[row + i][col].getShip()) {
                            nonemptyIndex = row + i
                        }
                    }
        
                    if (nonemptyIndex !== null) {
                        row = nonemptyIndex
                    }
                    else {
                        lines.push([
                            [row, col],
                            [row + length - 1, col]
                        ])
                    }
                }

                row++
                
                if (row === _size) {
                    row = 0
                    col++
                }
            }

            return lines
        }

        function emptyHorizontalLines(length) {
            const lines = []
            let row = 0
            let col = 0

            while (row < _size) {

                if (col + length > _size) {
                    // skip to end of col to quicken leap to next col
                    col = _size - 1
                }
                else {
                    let nonemptyIndex = null

                    for (let i=0; i<length; i++) {
                        // No break, since index after nonempty index
                        // could also be nonempty
                        if (_cells[row][col + i].getShip()) {
                            nonemptyIndex = col + i
                        }
                    }
        
                    if (nonemptyIndex !== null) {
                        col = nonemptyIndex
                    }
                    else {
                        lines.push([
                            [row, col],
                            [row, col + length - 1]
                        ])
                    }
                }

                col++
                
                if (col === _size) {
                    col = 0
                    row++
                }
            }

            return lines
        }

        function getSize() {
            return _size
        }

        return { 
            addShip, 
            receiveAttack, 
            allShipsSunk, 
            getSize, 
            randomUnhitCoords,
            randomEmptyStraightLine
        }
    }


    function Ship(name, length) {
        Ship.max_length = 5
        Ship.min_length = 2
        Ship.nextId = Ship.nextId ?? 0

        const _id = Ship.nextId++
        const _name = name
        const _length = validLength(length)
        let _hits = 0

        function validLength(length) {
            
            if (length > Ship.max_length || length < Ship.min_length) {
                throw new RangeError(`Length range is [2, 5].`)
            }
            
            return length
        }

        function hit() {
            _hits++
        }

        function isSunk() {
            return _hits === _length
        }

        function getId() {
            return _id
        }

        function getName() {
            return _name
        }

        function getLength() {
            return _length
        }

        function getType() {
            return 'ship'
        }

        return { hit, isSunk, getId, getName, getLength, getType }
    }


    function Player(name, gameBoard, ai=false) {
        Player.nextId = Player.nextId ?? 0

        const _id = Player.nextId++
        const _name = name
        const _gameBoard = gameBoard
        const _ai = ai
        const _wins = 0

        function win() {
            _wins++
        }

        function getId() {
            return _id
        }
        
        function getName() {
            return _name
        }

        function getGameBoard() {
            return _gameBoard
        }

        function getAi() {
            return _ai
        }

        function getWins() {
            return _wins
        }

        return { 
            win, 
            getId, 
            getName, 
            getGameBoard, 
            getAi, 
            getWins 
        }
    }

    return { Gameboard, Ship, Player }

})()


export { gameComps }