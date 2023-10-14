function Ship(name, length) {
    Ship.max_length = 5
    Ship.min_length = 2
    Ship.nextId = Ship.nextId ?? 0

    const _id = Ship.nextId++
    const _name = name
    const _length = validLength(length)
    let _hits = 0
    // Position has format [startCoords, endCoords]
    // Coords has format [row, col]
    let _position = null

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

    function getPosition() {
        return _position
    }

    function setPosition(position) {
        _position = position
    }

    return { 
        hit, 
        isSunk, 
        getId, 
        getName, 
        getLength, 
        getType,
        getPosition,
        setPosition
    }
}


export { Ship }