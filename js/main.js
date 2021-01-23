
const BOMB = '💣';
const MARKED = '🚩';

var gBoard;
var gGame;
var gElShownCounter = document.querySelector('h2.shown span');
var gElLackCounter = document.querySelector('.shown-cont .content-cont h2');
var gElRemainedFlags = document.querySelector('.flags-cont .content-cont h2');
var gElTime = document.querySelector('.timer-cont h2 span');



var elSelect = document.querySelector('select');
elSelect.addEventListener('change', (event) => {
    var level = event.target.value;
    console.log('cahnged');
    initGame(0, level);
});


//*functions:*


function restartClick() {
    var elSelect = document.querySelector('.restart-cont select');
    var level = elSelect.value;
    initGame(0, level);
    hideGameOver();
    var elUniSelect = document.querySelector('select');
    elUniSelect.value = level;
}


function hideGameOver() {
    var elCont = document.querySelector('.shadow');
    elCont.classList.add('hidden');
}



function initGame(elLevel, level) {
    //reset timer:
    if (gGame) {
        if (gGame.intervalTimer) clearInterval(gGame.intervalTimer);
    }
    //reset data:
    gGame = {
        isOn: true,
        minesCoords: [],
        numsToDraw: [],
        size: 0,
        mines: null,
        shown: 0,
        universal: 0,
        lack: null,
        time: 0,
        flagsLack: 0,
        intervalTimer: 0
    }
    gBoard = 0;

    //option to init also without element:
    if (!elLevel) {
        var level = level;
        console.log(level);
    } else {
        var level = elLevel.innerHTML;
        console.log(level);
    }
    var size;
    switch (level) {
        case 'easy':
            gGame.size = 4;
            gGame.mines = 2;
            break;
        case 'medium':
            gGame.size = 8;
            gGame.mines = 8;
            break;
        case 'hard':
            gGame.size = 12;
            gGame.mines = 15;
            break;

        default:
            break;
    }
    gGame.universal = gGame.size * gGame.size;
    gGame.lack = gGame.universal - gGame.mines;
    gGame.flagsLack = gGame.mines;

    //update DOM:
    renderBoard(gGame.size);
    renderStats();
}


function renderBoard(size) {
    var elTable = document.querySelector('table');
    var strHtml = '';
    var currColor;
    for (let i = 0; i < size; i++) {
        strHtml += '<tr>';
        for (let j = 0; j < size; j++) {
            //give the cell background class:
            if (((i % 2) && (!(j % 2))) || ((!(i % 2)) && (j % 2))) {
                currColor = 'blue';
            } else currColor = 'light-blue';

            strHtml += '<td class="block clickable ' + currColor + '" data-i="' + i + '" data-j="' + j + '" onclick="cellClicked(this)" oncontextmenu="cellMarked(this);return false;">';
            strHtml += '</td>';
        }
    }
    elTable.innerHTML = strHtml;
}


function buildBoard(size) {
    var board = [];
    for (let i = 0; i < size; i++) {
        board[i] = [];
        for (let j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                forceNotMine: false
            }
            gGame.numsToDraw.push({ i: i, j: j });
            // gGame.numsToDraw.push((i * 10) + j);
        }
    }
    return board;
}


function createMines(cellI, cellJ) {
    //create mines gGame.mines times:
    var minesQuant = 0;
    while (minesQuant < gGame.mines) {
        var idx = getRandomIntInclusive(0, gGame.numsToDraw.length - 1);
        console.log('idx:', idx);
        var mineI = gGame.numsToDraw[idx].i;
        var mineJ = gGame.numsToDraw[idx].j;
        if ((mineI < cellI - 1) || (mineI > cellI + 1) || (mineJ < cellJ - 1) || (mineJ > cellJ + 1)) {
            //make sure to remove this randNum from gNumstoDraw for avoiding picking him twice:
            gGame.numsToDraw.splice(idx, 1);

            //update personal data:
            gBoard[mineI][mineJ].isMine = true;
            //update neighbors data:
            addMinesCountToNeigh(mineI, mineJ);
            //update model:
            gGame.minesCoords.push({ i: mineI, j: mineJ });
            //update curr mines quant:
            minesQuant++;
        } else gGame.numsToDraw.splice(idx, 1);
    }
}


function firstClick(elCell) {
    var cellI = parseInt(elCell.getAttribute('data-i'));
    var cellJ = parseInt(elCell.getAttribute('data-j'));

    //update model:
    gBoard = buildBoard(gGame.size);
    createMines(cellI, cellJ);

    //start timer
    gGame.intervalTimer = setInterval(function () {
        gGame.time++;
        gElTime.innerText = gGame.time;
    }, 1000);
    gElTime.innerText = ++gGame.time;
}


function addMinesCountToNeigh(mineI, mineJ) {
    for (let i = (mineI - 1); i <= (mineI + 1); i++) {
        if ((i < 0) || (i >= gBoard.length)) continue;
        for (let j = (mineJ - 1); j <= (mineJ + 1); j++) {
            if ((j < 0) || (j >= gBoard[0].length) || (i === mineI && j === mineJ)) continue;
            gBoard[i][j].minesAroundCount++;
        }
    }
}


function cellClicked(elCell) {
    //in case that it is first click:
    if (!gBoard) {
        firstClick(elCell);
    }

    //allow only if game is on:
    if (!gGame.isOn) return 'game over';

    var cellI = parseInt(elCell.getAttribute('data-i'));
    var cellJ = parseInt(elCell.getAttribute('data-j'));
    var cell = gBoard[cellI][cellJ];

    //only if cell isnt shown yet:
    if (cell.isShown) return;

    if (cell.isMine) {
        //lose scanerio
        endGame('L');
    } else if (cell.minesAroundCount > 0) {
        //cell with mines around scanrio
        minesAround(cellI, cellJ, elCell);
    } else {
        //cell without mines around scanerio
        noMinesAround(cellI, cellJ, elCell);
    }
}


function minesAround(cellI, cellJ, elCell) {
    var cell = gBoard[cellI][cellJ];
    //update data:
    cell.isShown = true;
    gGame.shown++;
    gGame.lack--;
    renderStats();
    //DOM
    elCell.innerText = cell.minesAroundCount;
    elCell.setAttribute('data-mines-around', cell.minesAroundCount);
    elCell.classList.remove('clickable');
    //check if game over:
    checkGameOver(gBoard);
}


function noMinesAround(cellI, cellJ, elCell) {
    //avoid from checking a cell that already checked:
    if (gBoard[cellI][cellJ].isShown) return;

    //cell and board data:
    gBoard[cellI][cellJ].isShown = true;
    gGame.shown++;
    gGame.lack--;
    renderStats();

    //cell DOM:
    elCell.setAttribute('data-mines-around', gBoard[cellI][cellJ].minesAroundCount);
    elCell.classList.remove('clickable');

    //check if game over:
    checkGameOver();

    //now loop on all the other cells *and continue if you are in the cell we checked just now*:
    for (let i = (cellI - 1); i <= (cellI + 1); i++) {
        if ((i < 0) || (i >= gBoard.length)) continue;
        for (let j = (cellJ - 1); j <= (cellJ + 1); j++) {
            if ((j < 0) || (j >= gBoard[0].length) || (i === cellI && j === cellJ)) continue;

            var currCell = gBoard[i][j];
            var elCurrCell = document.querySelector('[data-i="' + i + '"][data-j="' + j + '"]');
            //avoid check an already checked cell:
            if (currCell.isShown) continue;

            //scanerios:
            if (currCell.minesAroundCount === 0) {
                //a cell without mines around scanerio:
                noMinesAround(i, j, elCurrCell);
            } else {
                //a cell with mines around scanerio:
                minesAround(i, j, elCurrCell);
            }
        }
    }
}


function cellMarked(elCell) {
    if (!gGame.isOn) return 'game over';

    var i = parseInt(elCell.getAttribute('data-i'));
    var j = parseInt(elCell.getAttribute('data-j'));
    var cell = gBoard[i][j];

    if (!cell.isShown) {
        if (!cell.isMarked) {
            //update model:
            cell.isMarked = true;
            //model and DOM:
            gGame.flagsLack--;
            renderStats();
            //update DOM:
            elCell.innerText = '🚩';
        } else {
            //update model:
            cell.isMarked = false;
            //model and DOM:
            gGame.flagsLack++;
            renderStats();
            //update DOM:
            elCell.innerText = '';
        }
    }
}


function checkGameOver() {
    if (gGame.lack === 0) {
        console.log('win');
        endGame('W');
    }
}


function renderStats() {
    gElRemainedFlags.innerText = gGame.flagsLack;
    gElShownCounter.innerText = gGame.shown;
    gElLackCounter.innerText = gGame.lack;
    gElTime.innerText = gGame.time;
}


function endGame(loseOrWin) {
    gGame.isOn = false;

    //reset timer:
    if (gGame.intervalTimer > 0) {
        clearInterval(gGame.intervalTimer);
        gGame.intervalTimer = 0;
    }
    var elText = document.querySelector('.shadow h2');
    if (loseOrWin === 'L') {

        for (let i = 0; i < gGame.minesCoords.length; i++) {
            var cellI = gGame.minesCoords[i].i;
            var cellJ = gGame.minesCoords[i].j;
            var elCurrMine = document.querySelector('[data-i="' + cellI + '"][data-j="' + cellJ + '"]');
            elCurrMine.innerText = BOMB;
            elCurrMine.classList.add('bomb');
            elCurrMine.classList.remove('clickable');
            elText.innerText = 'you snoozed, and therefore you loosed';
        }
    } else {
        console.log('win');
        elText.innerText = 'you won';
    }
    var elCont = document.querySelector('.shadow');
    elCont.classList.remove('hidden');
}