const helpText = `
Синтаксис броска: 
    /r (*X*d*Y*[![M]])(+/-*Z*)(x*K*) (*Комментарий*)
    В сокращенной форме "/r" эквивалентно "/r 1d10",
    "/п" эквивалентно "/r 1d100"
    Простой бросок: 
    */r 3d6*\nС модификатором: 
    */r 1d20+2*
    */r 1d10-5*
    Бросить несколько раз: 
    */r 3d6x5*
    */r3d6+10x5*
    С комментариями:
    */r 1d5 Атака*
    */r 1d20+2 Текст броска*
    */r 3d6+2x5 Пачка бросков*
    
    
    FATE бросок:
    */f(+/-*Z*)(x*K*)*
    Например:
    */f*
    */f+2*
    */f+2x3*
    */f+2x3 Броски инициативы*
    
    Построение графика распределения: 
    /countStatd6    
    /countStat3d6
    /countStatF
    /countStatDiff3d6
    /countStatDiffF
    /countStatMin3d6
    /countStatMinF
    
    Так же бот поддерживает команды в русской раскладке (r=р, f=ф, d=д, x=х):
    /р, /р3д6, /р3д6х2, /ф, /ф+2, /ф+2х2
    
    
    /getLog позволяет получить список уже сделанных бросков в текущем канале с момента последней перезагрузки сервера Heroku`

const rndX = function(x) {
    return Math.round((Math.random() * x) + 0.5)
}

const rnd6 = function() {
    return rndX(6)
}

const rnd10 = function() {
    return rndX(10)
}

const rnd3d6 = function() {
    return rnd6() + rnd6() + rnd6()
}

const rndF = function() {
    return rndX(3) + rndX(3) + rndX(3) + rndX(3) - 8
}

const countStat = function(expNum, fn) {
    const resArr = []
    let resText = ''

    for (let i = 0; i < expNum; i++) {
        const res = fn()

        resArr[res] = resArr[res] ? resArr[res] : 0
        resArr[res]++
    }

    resArr.forEach(function(currentValue, index, arr) {
        resText = resText + index + ': *' + Math.round(currentValue / expNum * 10000) / 100 + '*%\n'
    })

    return resText
}

const countStatDig = function(expNum, fn) {
    const resArr = []
    let resText = ''
    let min = 0
    let max = 0

    for (let i = 0; i < expNum; i++) {
        const res = fn()

        if (min > res) {
            min = res
        }

        if (max < res) {
            max = res
        }

        resArr[res] = resArr[res] ? resArr[res] : 0
        resArr[res]++
    }

    for (let i = min; i <= max; i++) {
        const index = i
        const currentValue = resArr[i]

        if (currentValue != undefined) {
            resText = resText + index + ': *' + Math.round(currentValue / expNum * 10000) / 100 + '*%\n'
        }
    }

    return resText
}

const countClaimSuccess = function (stat, minSuccess) {
    return function() {
        let result = 0

        if (stat < 5) {
            const mod = 5 - stat
            const res = rnd10() - mod

            if (res >= minSuccess) {
                return 1
            } else {
                return 0
            }
        }

        const rollNum = stat - 4

        for (let i = 0; i < rollNum; i++) {
            if (rnd10() >= minSuccess) {
                result++
            }
        }

        return result
    }
}

const countMinFn = function(Min, expNum, fn) {
    let count = 0

    expNum = expNum || 20000

    for (let i = 0; i < expNum; i++) {
        const rnd = fn()

        if (rnd >= Min) {count++}
    }

    return 'Min ' + Min + ' : *' + Math.round(count / expNum * 10000) / 100 + '*%'
}

const countDiffFn = function(Num, expNum, fn) {
    let count = 0

    expNum = expNum || 20000

    for (let i = 0; i < expNum; i++) {
        if (fn() + Num >= fn()) {count++}
    }

    return 'Diff ' + Num + ' : *' + Math.round(count / expNum * 10000) / 100 + '*%'
}

const countStatDiff3d6 = function(expNum) {
    let res = ''

    for (let i = -12; i < 13; i++) {
        res = res + countDiffFn(i, expNum, rnd3d6) + '\n'
    }

    return 'Diff *3d6*\n\n' + res
}

const countStatDiffF = function(expNum) {
    let res = ''

    for (let i = -5; i < 6; i++) {
        res = res + countDiffFn(i, expNum, rndF) + '\n'
    }

    return 'Diff *F*\n\n' + res
}

const countStatMinF = function(expNum) {
    let res = ''

    for (let i = -4; i <= 4; i++) {
        res = res + countMinFn(i, expNum, rndF) + '\n'
    }

    return 'Min *F*\n\n' + res
}

const countStatMin3d6 = function(expNum) {
    let res = ''

    for (let i = 3; i <= 18; i++) {
        res = res + countMinFn(i, expNum, rnd3d6) + '\n'
    }

    return 'Min *3d6*\n\n' + res
}

const questStep = function(RerCount, th) {
    while (RerCount>-1)
    {
        if (rnd3d6()>=th)
        {
            return RerCount

        }
        else
        {
            RerCount--

        }

    }

    return RerCount
}

const countQuest = function(reroll, arr) {
    for (let i = 0; i < arr.length; i++) {
        reroll = questStep(reroll, arr[i])

        if (reroll < 0) {
            return reroll
        }
    }

    return reroll
}

const getQuestFn = function(reroll, arr) {
    return function() {
        return countQuest(reroll, arr)
    }
}

const getFName = function(v) {
    v = v > 8 ? 8 : v
    v = v < -4 ? -4 : v

    switch (v) {
        case 10:
            return 'Обалдеть!!!'
        case 9:
            return 'невероятный'
        case 8:
            return 'легендарный'
        case 7:
            return 'эпический'
        case 6:
            return 'фантастический'
        case 5:
            return 'великолепный'
        case 4:
            return 'отличный'
        case 3:
            return 'хороший'
        case 2:
            return 'неплохой'
        case 1:
            return 'средний'
        case 0:
            return 'посредственный'
        case -1:
            return 'плохой'
        case -2:
            return 'ужасный'
        case -3:
            return 'убийственно плохо'
        case -4:
            return '...'
    }
}

const workByData = ({ msgText, senderName, sendMessage, testRolls }) => {
    if (msgText == '/help' || msgText == '/start') {
        sendMessage(helpText, 'Markdown')
        return
    }

    if (msgText == '/countStat3d6') {
        sendMessage('Stat *3d6*\n' + countStat(1000000, rnd3d6), 'Markdown')
        return
    }

    if (msgText == '/countStatd6') {
        sendMessage('Stat *d6*\n' + countStat(1000000, rnd6), 'Markdown')
        return
    }

    if (msgText == '/countStatF') {
        sendMessage('Stat *F*\n' + countStatDig(1000000, rndF), 'Markdown')
        return
    }

    if (msgText == '/countStatDiff3d6') {
        sendMessage(countStatDiff3d6(1000000), 'Markdown')
        return
    }

    if (msgText == '/countStatDiffF') {
        sendMessage(countStatDiffF(1000000), 'Markdown')
        return
    }

    if (msgText == '/countStatMinF') {
        sendMessage(countStatMinF(1000000), 'Markdown')
        return
    }

    if (msgText == '/countStatMin3d6') {
        sendMessage(countStatMin3d6(1000000), 'Markdown')
        return
    }

    if (msgText.slice(0, 3) == '/Cl' || msgText.slice(0, 3) == '/cl') {
        var command = msgText.slice(3).trim()
        var arr = command.split(' ')
        var stat = arr[1]
        var diffLevel = arr[0]
        var resText = 'Сложность проверки CLAIM: *' + diffLevel + '*, значение характеристики: *' + stat + '* \n'
        resText = resText + countStatDig(10000000, countClaimSuccess(stat, diffLevel))
        sendMessage(resText, 'Markdown')
        return
    }

    /*
    var match = msgText.match(/^\/(|[r|р])\s*(|\d+)\s*(q|к)(\s*)((\d*\s*)*)/);
    if (match) {
      var reroll = match[2] ? match[2] : 0;
      var arrSteps = match[5].trim();
      while (arrSteps.indexOf('  ') > -1) {
        arrSteps = arrSteps.replace('  ', ' ');
      }
      var resText = 'Цепочка шагов: *' + arrSteps + '*\n';
      if (reroll) {
        resText = resText + 'Перебросов: *' + reroll + '*\n'
      } else {
        resText = resText + 'Перебросов нет\n'
      }
      arrSteps = arrSteps.split(' ');
      if (arrSteps.length > 0) {
        var fn = getQuestFn(reroll, arrSteps)
        resText = resText + countStatDig(1000000, fn)
        sendMessage(resText, {
          parse_mode: 'Markdown'
        })
        return;
      }
    }*/
    var counter = -1

    var mod
    var repeater
    var comment
    var doRoll = null
    var rollRes = ''
    var parseMode = ''
    var findRegex = false
    var boldBeg = ''
    var boldEnd = ''
    match = msgText.match(/^\/[f|ф]\s*(|[\+-]\d+)\s*(|[x|х]\d+)(|[^0-9+\-xхф].*?)$/)

    if (match) {
        console.log('fate dice recognised')
        findRegex = true
        mod = match[1]
        repeater = match[2]
        comment = match[3]
        var rollSynt = 'F'

        if (mod) {
            rollSynt = rollSynt + mod
        }

        if (repeater) {
            rollSynt = rollSynt + repeater
        }

        boldBeg = '<b>'
        boldEnd = '</b>'
        parseMode = 'HTML'

        doRoll = function () {
            var result = 0
            var resultParts = ''

            for (var i = 0; i < 4; i++) {
                var t = rndX(3)

                if (t == 1) {
                    result--
                    resultParts = resultParts + '[-]'
                } else if (t == 2) {
                    resultParts = resultParts + '[ ]'
                } else if (t == 3) {
                    result++
                    resultParts = resultParts + '[+]'
                }
            }

            if (mod != '') {
                result = result + parseInt(mod, 0)
                resultParts = resultParts + ' <b>' + mod + '</b>'
            }

            if (counter > 0) {
                rollRes = rollRes + '\n<b>' + counter + '</b>: ' + resultParts + ' = <b>' + result + '</b> <i>(' + getFName(result) + ')</i>'
                counter++
            } else {
                rollRes = rollRes + resultParts + ' = <b>' + result + '</b> <i>(' + getFName(result) + ')</i>'
            }
        }
    } else {
        let actText = msgText

        match = actText.match(/^\/([rрpп])\s*\+\s*(\d+)([^0-9+\-xdхд].*?)?$/)

        if (match) {
            console.log(`simple dice recognised, ${actText}`)

            if (match[1] == 'r' || match[1] == 'p' || match[1] == 'р') {
                actText = '/r1d20+' + match[2] + (match[3] ? match[3] : '')
            } else if (match[1] == 'п') {
                actText = '/r1d100+' + match[2] + (match[3] ? match[3] : '')
            }
        }

        console.log(`common dice recognised, ${actText}`)
        match = actText.match(/^\/[rрpп]\s*((?:(?:(?:\d+[dд]\d+(?:\!\d*)?)|\d+)\s*[\+-]?\s*)*)([xх]\s*\d+)?([^0-9+\-xdхд].*?)?$/)

        if (match) {

            findRegex = true
            boldBeg = '*'
            boldEnd = '*'
            parseMode = 'Markdown'

            let rollCommand = match[1]

            if (rollCommand.indexOf('d') == -1 && rollCommand.indexOf('д') == -1 && rollCommand.indexOf('d') == -1) {
                if (actText[1] == 'r' || actText[1] == 'p' || actText[1] == 'р') {
                    rollCommand = '1d10'
                } else if (actText[1] == 'п') {
                    rollCommand = '1d100'
                }
            }

            repeater = match[2]
            comment = match[3]

            if (repeater) {
                rollSynt = rollSynt + repeater
            }

            rollSynt = rollCommand.replace(/ /g, '')
            counter = 0

            doRoll = function () {
                result = 0
                var resultParts = ''
                let command = rollCommand.replace(/ /g, '')
                let curOp = '+'
                let nextOp = '+'

                while (command.length > 0) {
                    const BIGINT = 99999999999
                    const incIndex = command.indexOf('+') !== -1 ? command.indexOf('+') : BIGINT
                    const decIndex = command.indexOf('-') !== -1 ? command.indexOf('-') : BIGINT

                    console.log(`incIndex ${incIndex} decIndex ${decIndex}`)
                    let curIndex = command.length

                    if (incIndex < decIndex && incIndex !== BIGINT) {
                        nextOp = '+'
                        curIndex = incIndex
                    } else if (decIndex < incIndex && decIndex !== BIGINT) {
                        nextOp = '-'
                        curIndex = decIndex
                    } else {
                        nextOp = '+'
                    }

                    const currCommand = command.slice(0, curIndex)

                    command = command.slice(curIndex + 1)
                    console.log(`currCommand ${command} curOp ${curOp} nextOp ${nextOp} index ${curIndex}`)
                    const matchCurr = currCommand.match(/^(\d+)[dд](\d+)(\!\d*)?$/)

                    if (matchCurr) {
                        const numDice = parseInt(matchCurr[1])
                        const diceVal = parseInt(matchCurr[2])
                        const burstLimit = matchCurr[3] !== undefined ? (matchCurr[3].length > 1 ? parseInt(matchCurr[3].slice(1)) : 9999) : 0
                        let burstCount = 0

                        console.log(`numDice ${numDice} diceVal ${diceVal} burstLimit ${burstLimit}`)

                        for (let i = 0; i < numDice + burstCount; i++) {
                            let t

                            if (testRolls && testRolls.length > 0) {
                                t = parseInt(testRolls.shift(), 0)
                                t = t > diceVal ? diceVal : t
                            } else {
                                t = rndX(diceVal)
                            }

                            let burstPostfix = ''

                            if (t === diceVal && burstCount < burstLimit) {
                                console.log('burst! inc burstCount')
                                burstPostfix = '*!*'
                                burstCount = burstCount + 1
                            }

                            if (curOp === '+') {
                                result = result + t
                                resultParts = resultParts + '+' + t + burstPostfix
                            } else if (curOp === '-') {
                                result = result - t
                                resultParts = resultParts + '-' + t + burstPostfix
                            }

                            console.log(`result ${result} parts ${resultParts}`)
                        }

                        if (burstCount > 0) {
                            resultParts = resultParts + ` *${burstCount}B* `
                        }
                    } else {
                        const t = parseInt(currCommand)

                        if (curOp === '+') {
                            result = result + t
                            resultParts = resultParts + '+*' + t + '*'
                        } else if (curOp === '-') {
                            result = result - t
                            resultParts = resultParts + '-*' + t + '*'
                        }

                        console.log(`result ${result} parts ${resultParts}`)
                    }

                    curOp = nextOp
                }

                if (counter > 0) {
                    rollRes = rollRes + '\n*' + counter + '*: ' + resultParts.slice(1) + ' = *' + result + '*'
                    counter++
                } else {
                    rollRes = rollRes + resultParts.slice(1) + ' = *' + result + '*'
                }
            }
        }
    }

    if (findRegex) {
        var textRes = senderName + ', бросок ' + boldBeg + rollSynt + boldEnd +
            '. '

        if (comment) {
            while (comment[0] == ' ') {
                comment = comment.slice(1)
            }

            textRes = textRes + boldBeg + comment + boldEnd + '\n'
        }

        if (repeater) {
            repeater = repeater.slice(1)
            counter = 1

            for (var i = 0; i < parseInt(repeater, 0); i++) {
                doRoll()
            }
        } else {
            counter = -1
            doRoll()
        }

        textRes = textRes + rollRes

        sendMessage(textRes, parseMode)
    }
}

module.exports = {
  workByData
}
