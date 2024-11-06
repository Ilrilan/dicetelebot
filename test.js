const { workByData } = require('./src/parse-command')

const sendMessage = jest.fn()

const innerTest = (commandText, testRolls, expectedRes, expectedFormat = 'Markdown') => {
    sendMessage.mockClear()
    workByData({
        msgText: `/${commandText} comment`,
        senderName: 'Test user',
        sendMessage,
        testRolls
    })
    const calledResult = sendMessage.mock.calls[0][0].replace(/\n/g, ' ').replace(/\s\s+/g, ' ')

    expect(calledResult).toEqual(expectedRes)
}

describe('All tests', () => {
    describe('Base tests', () => {
        it('simple d20', () => {
            innerTest('r1d20',
                [15],
                'Test user, бросок *1d20*. *comment* 15 = *15*')
        })
        it('burst', () => {
            innerTest('r5d6!',
                [1, 3, 6, 5, 6, 6, 6, 1, 2],
                'Test user, бросок *5d6!*. *comment* 1+3+6*!*+5+6*!*+6*!*+6*!*+1+2 *4B* = *36*')
        })
        it('limited burst', () => {
            innerTest('r5d6!1',
                [1, 3, 6, 5, 6, 6, 6, 1, 2],
                'Test user, бросок *5d6!1*. *comment* 1+3+6*!*+5+6+6 *1B* = *27*')
        })
        it('two rolls', () => {
            innerTest('r1d20+1d6',
                [15, 3],
                'Test user, бросок *1d20+1d6*. *comment* 15+3 = *18*')
        })
        it('plus modifier', () => {
            innerTest('r1d20+5',
                [15],
                'Test user, бросок *1d20+5*. *comment* 15+*5* = *20*')
        })
        it('minus modifier', () => {
            innerTest('r1d20-5',
                [15],
                'Test user, бросок *1d20-5*. *comment* 15-*5* = *10*')
        })
    })
    describe('Roll twice', () => {
        it('simple d20', () => {
            innerTest('r1d20x2',
                [15, 10],
                'Test user, бросок *1d20*. *comment* *1*: 15 = *15* *2*: 10 = *10*')
        })
        it('burst', () => {
            innerTest('r5d6!x2',
                [1, 3, 6, 5, 6, 6, 6, 1, 2, 3, 5, 4, 1, 6, 6, 3, 2],
                'Test user, бросок *5d6!*. *comment* *1*: 1+3+6*!*+5+6*!*+6*!*+6*!*+1+2 *4B* = *36* *2*: 3+5+4+1+6*!*+6*!*+3 *2B* = *28*')
        })
        it('limited burst', () => {
            innerTest('r5d6!1x2',
                [1, 3, 6, 5, 6, 6, 6, 1, 2, 3, 5, 4, 1, 6, 6, 3, 2],
                'Test user, бросок *5d6!1*. *comment* *1*: 1+3+6*!*+5+6+6 *1B* = *27* *2*: 6*!*+1+2+3+5+4 *1B* = *21*')
        })
        it('two rolls', () => {
            innerTest('r1d20+1d6x2',
                [15, 3, 10, 6],
                'Test user, бросок *1d20+1d6*. *comment* *1*: 15+3 = *18* *2*: 10+6 = *16*')
        })
        it('plus modifier', () => {
            innerTest('r1d20+5x2',
                [15, 10],
                'Test user, бросок *1d20+5*. *comment* *1*: 15+*5* = *20* *2*: 10+*5* = *15*')
        })
        it('minus modifier', () => {
            innerTest('r1d20-5x2',
                [15, 10],
                'Test user, бросок *1d20-5*. *comment* *1*: 15-*5* = *10* *2*: 10-*5* = *5*')
        })
    })
})
