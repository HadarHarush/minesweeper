function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}



   //delete all the non-cells items from gDrawNums:
    // var minI = cellI - 1;
    // var minJ = cellJ - 1;
    // for (let i = minI; i <= minI + 2; i++) {
    //     var idx = gGame.numsToDraw.indexOf(i * 10 + minJ);
    //     gGame.numsToDraw.splice(idx, 3);
    // }


        // for (let i = 0; i < gGame.mines; i++) {
    //draw numbers, convert their value to mineI and mineJ idx's
    // var randNum = getRandomIntInclusive(0, gGame.numsToDraw.length - 1);
    // var mineI = parseInt(gGame.numsToDraw[randNum] / 10);
    // var mineJ = gGame.numsToDraw[randNum] - (mineI * 10);
    // console.log('mine i', mineI);
    // console.log('mine j', mineJ);

    //make sure to remove this randNum from gNumstoDraw for avoiding picking him twice:
    // gGame.numsToDraw.splice(randNum, 1);

    //update personal data:
    // gBoard[mineI][mineJ].isMine = true;
    //update neighbors data:
    // addMinesCountToNeigh(mineI, mineJ);
    //update model:
    // gGame.minesCoords.push({ i: mineI, j: mineJ });
    // }