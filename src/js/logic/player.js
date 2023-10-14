function Player(name, gameboard, ai=false) {
    Player.nextId = Player.nextId ?? 0

    const _id = Player.nextId++
    const _name = name
    const _ai = ai
    let _gameboard = gameboard
    let _wins = 0

    function win() {
        _wins++
    }

    function getId() {
        return _id
    }
    
    function getName() {
        return _name
    }

    function getGameboard() {
        return _gameboard
    }

    function setGameboard(gameboard) {
        _gameboard = gameboard
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
        getGameboard,
        setGameboard, 
        getAi, 
        getWins 
    }
}


export { Player }