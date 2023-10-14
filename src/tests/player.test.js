import { Player } from "../js/logic/player";
import { Gameboard } from "../js/logic/gameboard";


test('Unique ID', () => {
    const p1 = Player('a', Gameboard())
    const p2 = Player('b', Gameboard())
    expect(p1.getId()).not.toBe(p2.getId())
})