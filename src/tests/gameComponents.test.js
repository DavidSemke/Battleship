import { gameComps } from "../js/gameComponents";


describe('GameBoard', () => {
    let gameboard;
    
    beforeEach(() => {
        gameboard = gameComps.Gameboard()
    })

    describe('Adding ships', () => {

        test('Add ship using forwards/backwards coords', () => {
            const ship1 = gameComps.Ship(5)
            expect(
                gameboard.addShip(ship1, [0, 0], [4, 0])
            ).toBeUndefined()
            
            const ship2 = gameComps.Ship(5)
            expect(
                gameboard.addShip(ship2, [4, 0], [0, 0])
            ).toBeUndefined()
        })

        test('Added ship does not fill coordinates', () => {
            const ship1 = gameComps.Ship(5)
            
            expect(() => {
                gameboard.addShip(ship1, [0, 0], [5, 0])
            }).toThrow(Error)

            expect(() => {
                gameboard.addShip(ship1, [0, 0], [0, 3])
            }).toThrow(Error)
        })

        test('Add ship to occupied coordinates', () => {
            const ship1 = gameComps.Ship(5)
            gameboard.addShip(ship1, [0, 0], [4, 0])

            const ship2 = gameComps.Ship(5)

            expect(() => {
                gameboard.addShip(ship2, [3, 0], [3, 4])
            }).toThrow(Error)
        })

        test('Add ship diagonally', () => {
            const ship1 = gameComps.Ship(5)
            
            expect(() => {
                gameboard.addShip(ship1, [0, 0], [4, 4])
            }).toThrow(Error)
        })

        test('Add ship out of bounds', () => {
            const boardSize = gameboard.getSize()
            const ship1 = gameComps.Ship(2)

            expect(() => {
                gameboard.addShip(ship1, [0, boardSize-1], [0, boardSize])
            }).toThrow(Error)
        })

        test('Add ship multiple times without overlap', () => {
            const ship1 = gameComps.Ship(5)
            gameboard.addShip(ship1, [0, 0], [4, 0])

            expect(() => {
                gameboard.addShip(ship1, [0, 1], [4, 1])
            }).toThrow(Error)
        })

        test('Add ship after first attack', () => {
            gameboard.receiveAttack([0, 0])
            
            const ship1 = gameComps.Ship(5)

            expect(() => {
                gameboard.addShip(ship1, [0, 0], [4, 0])
            }).toThrow(Error)
        })
    })

    describe('Receiving attacks', () => {

        test('Hit the same coords twice', () => {
            gameboard.receiveAttack([0, 0])

            expect(() => {
                gameboard.receiveAttack([0, 0])
            }).toThrow(Error)
        })

        test('Hit coords out of bounds', () => {
            const boardSize = gameboard.getSize()
            
            expect(() => {
                gameboard.receiveAttack([boardSize, 0])
            }).toThrow(Error)
        })
    })

    describe('Sinking all ships', () => {
        
        test('Sinking the last ship', () => {
            const ship = gameComps.Ship(2)
            gameboard.addShip(ship, [0, 0], [1, 0])
            gameboard.receiveAttack([0, 0])
            gameboard.receiveAttack([1, 0])
    
            expect(gameboard.allShipsSunk()).toBe(true)
        })
    })

    describe('Randomly choosing unhit coords', () => {

        test('Searching for last unhit coord', () => {
            const ship = gameComps.Ship(2)
            gameboard.addShip(ship, [0, 0], [1, 0])

            const size = gameboard.getSize()

            for (let i=0; i<size; i++) {
                let j = 0;

                if (i === 0) {
                    j = 1
                }

                for (; j<size; j++) {
                    gameboard.receiveAttack([i, j])
                }
            }

            // last unhit coord is then [0, 0]
            // process is random, so we will loop 100 times
            for (let i=0; i<100; i++) {
                expect(gameboard.randomUnhitCoords()).toEqual([0, 0])
            }
        })

        test('Searching for non-existent unhit coord', () => {
            const ship = gameComps.Ship(2)
            gameboard.addShip(ship, [0, 0], [1, 0])

            const size = gameboard.getSize()

            for (let i=0; i<size; i++) {
                for (let j=0; j<size; j++) {
                    gameboard.receiveAttack([i, j])
                }
            }

            expect(gameboard.randomUnhitCoords()).toBeNull()
        })
    })

    describe('Randomly choosing empty straight line coords', () => {
        
        test('Length exceeds board size', () => {
            expect(() => {
                gameboard.randomEmptyStraightLine(gameboard.getSize()+1)
            }).toThrow(RangeError)
        })

        test('Length equals board size', () => {
            expect(() => {
                gameboard.randomEmptyStraightLine(gameboard.getSize())
            }).not.toThrow(RangeError)
        })

        test('Length of size 1', () => {
            expect(() => {
                gameboard.randomEmptyStraightLine(1)
            }).toThrow(RangeError)
        })

        test('Failing to find any empty lines', () => {
            const size = gameboard.getSize()
            // Gameboard size must be divisible by ship size for lines 
            // to truly be maxed (ship size = 2 here)
            const maxLines = Math.floor(size / 2)*size

            // Ship placements random, so no guarantee of looping
            // maxLines times
            for (let i=0; i<maxLines; i++) {
                const ship = gameComps.Ship(2)
                const randLine = gameboard.randomEmptyStraightLine(2)

                if (!randLine) {
                    break
                }

                const [start, end] = randLine
                gameboard.addShip(ship, start, end)
            }

            // At this point, no more ships should be able to fit
            // Loop 100 times to reduce effects of randomness
            for (let i=0; i<100; i++) {
                expect(gameboard.randomEmptyStraightLine(2)).toBeNull()
            }
            
        })
    })
})

describe('Player', () => {

    test('Unique ID', () => {
        const p1 = gameComps.Player('a', gameComps.Gameboard())
        const p2 = gameComps.Player('b', gameComps.Gameboard())

        console.log(p1.getId())
        console.log(p2.getId())

        expect(p1.getId()).not.toBe(p2.getId())
    })
})