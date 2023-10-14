import { getRandomInt } from './random'


function Gameboard(size=10) {
    const _size = size
    const _cells = createCells()
    const _ships = []
    let _sunkShipCount = 0

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
            
            if (ship && _ship) {  
                throw new Error(`Cell is already occupied.`)
            }
            
            if (ship !== null && ship.getType() !== 'ship') {
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

    function shipOverlap(ship, startCoords, endCoords) {
        const [rowShift, colShift] = unitShifts(startCoords, endCoords)

        return !fromOrigin(
            startCoords, 
            ship.getLength(),
            (coords, i) => [
                coords[0] + i*rowShift, 
                coords[1] + i*colShift
            ],
            cell => !cell.getShip() || cell.getShip() === ship
        )
    }

    // coords have format [row, col]
    function addShip(ship, startCoords, endCoords) {

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

        const [rowShift, colShift] = unitShifts(startCoords, endCoords)

        fromOrigin(
            startCoords, 
            ship.getLength(),
            (coords, i) => [
                coords[0] + i*rowShift, 
                coords[1] + i*colShift
            ],
            cell => {
                cell.setShip(ship)
                return true
            }
        )

        ship.setPosition([startCoords, endCoords])
        _ships.push(ship)
    }

    // Returns the unit direction of endCoords relative to startCoords
    // for rows and columns
    function unitShifts(startCoords, endCoords) {
        const rowDiff = endCoords[0] - startCoords[0]
        const colDiff = endCoords[1] - startCoords[1]
        const rowShift = (rowDiff / Math.abs(rowDiff)) || 0
        const colShift = (colDiff / Math.abs(colDiff)) || 0

        return [rowShift, colShift]
    }

    function removeShip(ship) {

        for (const row of _cells) {
            for (const cell of row) {
                if (cell.getShip() === ship) {
                    cell.setShip(null)
                }
            }
        }

        const index = _ships.indexOf(ship)

        if (index !== -1) {
            _ships.splice(index, 1)
            ship.setPosition(null)
        }
    }

    // Perform cellFunc on gameboard cells starting at originCoords
    // and extending the operation to cellCount cells in the direction 
    // specified by updateCoord.
    // Function cellFunc should return a boolean; if false is returned
    // when applying it to any cell, this function returns false.
    // Else, this function returns true. 
    function fromOrigin(
        originCoords, cellCount, updateCoord, cellFunc
    ) {

        for (let i=0; i<cellCount; i++) {
            const [row, col] = updateCoord(originCoords, i)
            
            if (!cellFunc(_cells[row][col])) {
                return false
            }  
        }

        return true
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

    // Returns the ship occupying the hit cell; no ship returns null
    function receiveAttack(coords) {
        const [row, col] = coords
        const cell = _cells[row][col]
        cell.hit()

        const ship = cell.getShip()

        if (ship && ship.isSunk()) {
            _sunkShipCount++
        }

        return ship
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

        while (_cells[row][col].getHit()) {
            row += shift[0]
            
            if (row === _size || row === -1) {
                row = (row + _size) % _size
                col += shift[1]

                if (col === _size || col === -1) {
                    col = (col + _size) % _size
                }
            }

            // if all cells are hit, return null
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

        const verticals = emptyLines(length, 0)
        const horizontals = emptyLines(length, 1)
        const lines = [...verticals, ...horizontals]

        if (!lines.length) {
            return null
        }

        return lines[getRandomInt(lines.length)]
    }

    // Produces all empty vertical lines when axis = 0
    // Produces all empty horizontal lines when axis = 1 
    function emptyLines(length, axis) {
        const lines = []
        const minorAxis = axis ? 0 : 1
        let baseCoords = [0, 0]

        while (baseCoords[minorAxis] < _size) {

            if (baseCoords[axis] + length > _size) {
                // skip to end of row to quicken leap to next row
                baseCoords[axis] = _size - 1
            }
            else {
                let nonemptyIndex = null
                const row = baseCoords[0]
                const col = baseCoords[1]

                for (let i=0; i<length; i++) {
                    const coords = [row, col]
                    coords[axis] += i
                    // No break, since index after nonempty index
                    // could also be nonempty
                    if (_cells[coords[0]][coords[1]].getShip()) {
                        nonemptyIndex = coords[axis]
                    }  
                }

                if (nonemptyIndex !== null) {
                    baseCoords[axis] = nonemptyIndex
                }
                else {
                    const startCoords = [row, col]
                    const endCoords = [row, col]
                    endCoords[axis] += length - 1

                    lines.push([startCoords, endCoords])
                }
            }

            baseCoords[axis]++
            
            if (baseCoords[axis] === _size) {
                baseCoords[axis] = 0
                baseCoords[minorAxis]++
            }
        }

        return lines
    }

    function containsShip(ship) {
        return _ships.includes(ship)
    }

    function getSize() {
        return _size
    }

    return {
        shipOverlap,
        addShip,
        removeShip,
        receiveAttack, 
        allShipsSunk, 
        randomUnhitCoords,
        randomEmptyStraightLine,
        containsShip,
        getSize
    }
}


export { Gameboard }