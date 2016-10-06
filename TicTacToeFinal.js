const fs = require('fs');
const path = require('path');
const readline = require('readline');
const playerLetters = ['X','O','A','B','C','D','E','F','G','H','I','J','K','L','M','N','P','Q','R','S','T','U','V','W','Y','Z'];

var activeBoard = [];

//Default settings
var settings = {
    playerSize: 2,
    boardSize: 3,
    winSequence: 3,
    currentPlayer : 0
};

main();

//region SHAAKEED
function StartGameQuestions(){
    const rl = readline.createInterface(process.stdin, process.stdout);
	rl.question('Would you like to resume a saved game? (Y/N)\n', saved_game => {
    saved_game = saved_game.toUpperCase();
    if(saved_game === 'YES' || saved_game === 'Y'){
      console.log('\nYou picked saved game.\n');
        rl.close();
	  LoadGame(rl);
    }
    else if (saved_game === 'NO' || saved_game === 'N'){
      console.log('You picked a new game.');
      rl.question('How many players are there? (Maximum 26): ', players => {
        if(players <= 26){
          settings.playerSize = parseInt(players);
		  console.log(players);
          rl.question('How large is the board? (Maximum:999): ', board_size => {
            if(board_size <= 999){
              settings.boardSize = parseInt(board_size);
			  console.log(board_size);
              rl.question('What is the win sequence count? (# of symbols in a row) ', win_sequence => {
                if(win_sequence){
                  console.log(win_sequence);
				  settings.winSequence = parseInt(win_sequence);
                  rl.close();
                  beginGame(settings);
                }
                else{
                  console.log('Not a valid win sequence');
                  rl.close();
                }
              })
            }
            else{
              console.log('That board size is not valid');
              StartGameQuestions();
            }
          })
        }
        else{
          console.log('That amount of players is not valid');
          StartGameQuestions();
        }
      })
    }
    else{
      console.log('That is not a valid option.');
      StartGameQuestions();
    }
  })
}

var drawBoard = function(activeBoard){
	var board = '';

	//Row0 to start board numbers
	for(var row0 = 1; row0 <= activeBoard.length; row0++){
		if(row0 === 1){
			board += '    ' + row0;
		}
		else{
			board += '   ' + row0;
		}
	}

	//Rest of the rows and columns that setup the table
	for (var row = 0; row < activeBoard.length; row++){
		board += '\n' + Number(row+1) + '   ';

		for(var column = 0; column < activeBoard.length; column++){
			board += activeBoard[row][column];
      if(column < activeBoard.length - 1){
        board += ' | ';
      }
		}
		board += '\n   ';
    for(var row_col = 1; row_col < (activeBoard.length * 2); row_col++){
      if(row !== activeBoard.length - 1){
        if(row_col % 2 === 0){
          board += '+';
        }
        else{
          board += '---';
        }
			}
		}
	}
  return board;
};
//endregion


//region BRIAN
var LoadSavedGame = function (dir, file) {

    fs.readFile(path.join(dir, file + ".xml"), (err,data) => {
        const rl = readline.createInterface(process.stdin, process.stdout);
        if (err) {
            console.error("\nAn error occured while loading your game\n"/*, err*/);
            //StartGameQuestions();
            r1.close();
            LoadGame(rl);
        }
        else {
            r1.close();
            MyCrumbyXmlParser(data.toString());
        }
    })
};

var MyCrumbyXmlParser = function  (xmlString) {
    //var aSave = [];
    //console.log(xmlString);
    settings["players"] = xmlString.substring(xmlString.indexOf("<players>")+9,xmlString.indexOf("</players>"));
    settings["boardSize"] = xmlString.substring(xmlString.indexOf("<boardSize>")+11,xmlString.indexOf("</boardSize>"));
    settings["winSequence"] = xmlString.substring(xmlString.indexOf("<winSequence>")+13,xmlString.indexOf("</winSequence>"));
    settings["currentPlayer"] = xmlString.substring(xmlString.indexOf("<currentPlayer>")+15,xmlString.indexOf("</currentPlayer>"));

    activeBoard = createMatrix(settings.boardSize);
    for(var i = 0; i < settings.boardSize; i++) {
        for(var j = 0; j < settings.boardSize; j++) {

            var element = "<activeBoard" + i + '_' + j + '>';
            var elementEnd = "</activeBoard" + i + '_' + j + '>';

            var value = xmlString.substring(xmlString.indexOf(element)+ element.length, xmlString.indexOf(elementEnd));
            activeBoard[i][j] = value;
        }
    }
    resumeGame(activeBoard);

};

function resumeGame(activeBoard) {
    console.log("\n****Game Started*****");
    var board = drawBoard(activeBoard);
    console.log(board);
    recursiveAsyncReadLine();
}

function LoadGame() {
    const rl = readline.createInterface(process.stdin, process.stdout);
    rl.question("Please enter your save file name " +
        "\nor press Return to see a list of saved games" +
        "\nor type Exit to return to the menu... \n", resp => {

        if (resp == "") {
            rl.close();
            ShowSavedGames(__dirname);
        }
        else if (resp.toUpperCase() == "EXIT") {
            rl.close();
            StartGameQuestions();
        }
        else {
            rl.close();
            LoadSavedGame(__dirname, resp);
        }
    })
}

var ShowSavedGames = function (dir) {
    fs.readdir(dir, function(err, files) {
        var noFiles = "There are no save files";

        for (var i=0; i<files.length; i++) {

            if(files[i].toString().substring(files[i].toString().length - 4) == ".xml")
            {
                console.log(files[i].substring(0,files[i].length - 4));
                noFiles="";
            }

        }
        console.log(noFiles);
        LoadGame(rl);
    });
};
function SaveTheGame(rll, settings, activeBoard) {
    rll.question("\nPlease type a name for the saved game\n", answer => {
        if (answer) {
            var saveString = '<?xml version="1.0" encoding="UTF-8"?>' +
                '\r\n<saveFile>' +
                '\r\n\t<players>' + settings.playerSize + '</players>' +
                '\r\n\t<boardSize>' + settings.boardSize + '</boardSize>' +
                '\r\n\t<winSequence>' + settings.winSequence + '</winSequence>' +
                '\r\n\t<currentPlayer>' + settings.currentPlayer + '</currentPlayer>' +
                '\r\n\t<activeBoard>';


            for(var i = 0; i < settings.boardSize; i++) {
                for(var j = 0; j < settings.boardSize; j++) {
                    saveString = saveString +
                        '\r\n\t\t<activeBoard' + '' + i + '' + '_' + j + '' + '>' /*+ i + ',' + j + ',' */+ activeBoard[i][j] + '</activeBoard' + '' + i + '' + '_' + j + '' + '>';
                }
            }
            saveString = saveString + '\r\n\t</activeBoard>\r\n</saveFile>';

            fs.writeFile(path.join(__dirname, answer + ".xml"), saveString);
            console.log("\nYour game has been saved as", answer, "\n");
            StartGameQuestions();
        }
        else {
            console.log("invalid file name");
            SaveTheGame(settings,activeBoard);
        }
    })
}
//endregion

//region Kyle
function beginGame(settings) {
	console.log('****Game Started****');
	activeBoard = createMatrix(settings.boardSize);
	var board = drawBoard(activeBoard);
	console.log(board);
    recursiveAsyncReadLine();
}

var createMatrix = function(board_size){
    let matrix = [];
    for (var i = 0; i < board_size; i++) {
        let row = [];
        for (var i1 = 0; i1 < board_size; i1++) {
            row.push(' ');
        }
        matrix.push(row);
    }
    return matrix;
};

function playerMoved(row, column, value) {
    if (activeBoard[row][column] === ' '){
        activeBoard[row][column] = value;
        var board = drawBoard(activeBoard);
        console.log(board);
        checkForWinner(activeBoard, value, row, column);
        return true;
    } else {
        console.log('a player exists in that space, move invalid');
        return false;
    }

}
var recursiveAsyncReadLine = function () {
    const rl = readline.createInterface(process.stdin, process.stdout);
    if (settings.currentPlayer >= settings.playerSize){
        settings.currentPlayer = 0; // first player's turn again
    }

    rl.question('Player '+  playerLetters[settings.currentPlayer] +', Please enter a row,column (you may also type save to save the game): ', (answer)  => {
        if (answer == 'save') {//we need some base case, for recursion
            SaveTheGame(rl, settings, activeBoard);
            return;
        }
        else if(answer.toUpperCase() == 'Q'){
            return rl.close();
        }
        else {
            console.log('Got it! Your answer was:  ' + answer + '  "', playerLetters[settings.currentPlayer], '"');

            var canPlay = true;
            var grid = answer.split(',');
            var row = (parseInt(grid[0])-1),
                column = parseInt((grid[1])-1);
            if (row > (settings.boardSize-1) || row < 0){
                canPlay= false;
                console.log('invalid row coordinate');
            }
            if (column > (settings.boardSize-1) || column < 0){
                canPlay= false;
                console.log('invalid column coordinate');
            }
            if (canPlay){
                if (playerMoved(row, column, playerLetters[settings.currentPlayer])){
                    settings.currentPlayer++;
                }
            }
            rl.close();
            recursiveAsyncReadLine();
        }
    });
};


function checkForWinner(board, player, row, column){
    if (checkRows(board, player) || checkDiagonals(board, player, row, column) || checkDiagonalsOpp(board, player, row, column) || checkColumns(board, player)) {
        console.log('user has won');
        process.exit();
    }
    else if(checkTie(board)){
        console.log('it is a tie');
        process.exit();
    }
    else {
        console.log('not a winning move');
    }
}

function checkRows(board, player){
    // Iterate thru the matrix rows, summing values
        var win = false;
        for(var r = 0; r < board.length; r++){
            var rowSum = 1;
            var previousVal = 'start';
            for(var t = 0; t < board[r].length; t++) {
                if (board[r][t] === player) {
                    ++rowSum;
                    //console.log('found the players letter', player);
                   // console.log('current row sum', ++rowSum);
                    if (previousVal !== board[r][t] && rowSum > 2) {
                        rowSum = 0;
                        //console.log('current value doesnt match prior current row sum', rowSum);
                    }
                }
                previousVal = board[r][t];
                //console.log('previous cell value: ', previousVal);
                if(rowSum > settings.winSequence){
                    win = true;
                    break;
                }
            }
        }
        return win;
}

function checkDiagonals(board, player, row, column){
    var keepChecking = true;
    var hitCount = 1;
    var currentRow = row;
    var currentColumn = column;

    while (keepChecking){
        if(typeof board[++currentRow] === 'undefined') {
            keepChecking = false;
            break;
        }

        if(typeof board[currentRow][++currentColumn] === 'undefined') {
            keepChecking = false;
            break;
        }

        if (board[currentRow][currentColumn] == player) {

            ++hitCount;
            if (hitCount >= settings.winSequence)
                return true;
        } else {
            keepChecking = false;
        }
    }

    currentRow = row;
    currentColumn = column;
    keepChecking = true;

    while (keepChecking){

        if(typeof board[--currentRow] === 'undefined') {
            keepChecking = false;
            break;
        }

        if(typeof board[currentRow][--currentColumn] === 'undefined') {
            keepChecking = false;
            break;
        }

        if (board[currentRow][currentColumn] == player) {
            ++hitCount;

            if (hitCount >= settings.winSequence)
                return true;
        } else {

            keepChecking = false;
        }
    }
    return false;
}

function checkDiagonalsOpp(board, player, row, column){
    var keepChecking = true;
    var hitCount = 1;
    var currentRow = row;
    var currentColumn = column;
    while (keepChecking){
        if(typeof board[--currentRow] === 'undefined') {
            keepChecking = false;
            break;
        }

        if(typeof board[currentRow][++currentColumn] === 'undefined') {
            keepChecking = false;
            break;
        }

        if (board[currentRow][currentColumn] == player) {
            ++hitCount;

            if (hitCount >= settings.winSequence)
                return true;
        } else {
            keepChecking = false;
        }
    }

    currentRow = row;
    currentColumn = column;
    keepChecking = true;
    while (keepChecking){
        if(typeof board[++currentRow] === 'undefined') {
            keepChecking = false;
            break;
        }

        if(typeof board[currentRow][--currentColumn] === 'undefined') {
            keepChecking = false;
            break;
        }


        if (board[currentRow][currentColumn] == player) {
            ++hitCount;
            if (hitCount >= settings.winSequence)
                return true;
        } else {
            keepChecking = false;
        }
    }
    return false;
}

function checkColumns(board, player){
    function transpose(a) {
        return Object.keys(a[0]).map(
            function (c) { return a.map(function (r) { return r[c]; }); }
        );
    }
    return checkRows(transpose(board), player);
}

function checkTie(board){
  var tie = true;
  for(var i = 0; i < board.length; i++){
    if(board[i].indexOf(' ') >= 0){
      return tie = false;
    }
  }
  return true;
}

//endregion

function main(){
  console.log('Welcome to Advanced Customized Tic-Tac-Toe');
  console.log(
    '                X | O |   \n' +
    '               ---+---+--- \n' +
    '                O | X |   \n' +
    '               ---+---+--- \n' +
    '                O |   | X  \n');

	StartGameQuestions();
}
