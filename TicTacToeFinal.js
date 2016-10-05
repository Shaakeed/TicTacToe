const fs = require('fs');
const path = require('path');
const readline = require('readline');
const playerLetters = ['X','O','A','B','C','D','E','F','G','H','I','J','K','L','M','N','P','Q','R','S','T','U','V','W','Y','Z'];
const rl = readline.createInterface(process.stdin, process.stdout);

//Default settings
var settings = {
    playerSize: 2,
    boardSize: 3,
    winSequence: 3,
    currentPlayer : 0
};

main();

/***************************SHAAKEED********************************************************/
function StartGameQuestions(){
  rl.question('Would you like to resume a saved game? (Y/N)\n', saved_game => {
    saved_game = saved_game.toUpperCase();
    if(saved_game === 'YES' || saved_game === 'Y'){
      console.log('\nYou picked saved game.\n');
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

var drawBoard = function(board_size){
	var board = '';

	//Row0 to start board numbers
	for(var row0 = 1; row0 <= board_size; row0++){
		if(row0 === 1){
			board += '    ' + row0;
		}
		else{
			board += '   ' + row0;
		}
	}

	//Rest of the rows and columns that setup the table
	for (var row = 1; row <= board_size; row++){
		board += '\n' + row + '     ';

		for(var column = 1; column < board_size; column++){
			board += '|   ';
		}
		board += '\n   ';

		if(row < board_size){
			for(var row_col = 0; row_col < (board_size * 2 - 1); row_col++){
				if(row_col % 2 !== 0){
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
/*********************************************************************************************/

/****************************BRIAN*********************************************************/

var LoadSavedGame= function (rl, dir, file) {


    fs.readFile(path.join(dir, file + ".xml"), (err,data) => {
        if (err) {
            console.error("An error occured while loading your game, please choose a different save", err);
        }
        else {
            MyCrumbyXmlParser(data.toString());
        }
    })
    //rl.close();
}

var MyCrumbyXmlParser = function  (xmlString) {
    //var aSave = [];
    //console.log(xmlString);
    settings["players"] = xmlString.substring(xmlString.indexOf("<players>")+9,xmlString.indexOf("</players>"));
    settings["boardSize"] = xmlString.substring(xmlString.indexOf("<boardSize>")+11,xmlString.indexOf("</boardSize>"));
    settings["winSequence"] = xmlString.substring(xmlString.indexOf("<winSequence>")+13,xmlString.indexOf("</winSequence>"));

    beginGame(settings);
}

function LoadGame(rl) {

    rl.question("Please enter your save file name " +
        "\nor press Return to see a list of saved games" +
        "\nor type Exit to return to the menu... \n", resp => {

        if (resp == "") {
            ShowSavedGames(__dirname);
            return;
        }
        else if (resp.toUpperCase() == "EXIT") {
            rl.close();
            StartGameQuestions();
        }
        else {
            LoadSavedGame(rl, __dirname, resp);
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

    return;
}

function SaveTheGame(settings, activeBoard) {

    rl.question("\nPlease type a name for the saved game\n", answer => {
        if (answer) {
            var saveString = '<?xml version="1.0" encoding="UTF-8"?>' +
                '\r\n<saveFile>' +
                '\r\n\t<players>' + settings.playerSize + '</players>' +
                '\r\n\t<boardSize>' + settings.boardSize + '</boardSize>' +
                '\r\n\t<winSequence>' + settings.winSequence + '</winSequence>' +
                '\r\n\t<currentPlayer>' + settings.currentPlayer + '</currentPlayer>' +
                    '\r\n\t<activeBoard>';

            console.log(settings.boardSize);

            for(var i = 0; i < settings.boardSize; i++) {
                for(var j = 0; j < settings.boardSize; j++) {
                    saveString = saveString +
                        '\r\n\t\t<activeBoard' + '' + i + '' + '_' + j + '' + '>' + i + ',' + j + ',' + activeBoard[i][j] + '</activeBoard' + '' + i + '' + '_' + j + '' + '>';
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

/************************************************************************************/

/****************************KEVIN*********************************************************/
var activeBoard = [];

function beginGame(settings) {
    
	console.log('****Game Started****');
	activeBoard = createMatrix(settings.boardSize);
	board = drawBoard(settings.boardSize);
	console.log(board);
    recursiveAsyncReadLine();

    // playerMoved(3,3,'X');
    // playerMoved(1,2,'X');
    // playerMoved(1,7,'X');
    // playerMoved(1,1,'O');
    // playerMoved(2,1,'O');
    // playerMoved(3,1,'O');
    // playerMoved(4,1,'X');
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

    console.log(matrix);
    return matrix;
};

function playerMoved(row, column, value){
    console.log(row,column, value);
    if (activeBoard[row][column] === ' '){
        console.log('player has moved');
        activeBoard[row][column] = value;
        console.log(activeBoard);
    } else {
        console.log('a player exists in that space, move invalid');
    }
    checkForWinner(activeBoard, value);
}

var recursiveAsyncReadLine = function () {
    
    if (settings.currentPlayer >= settings.playerSize){
        settings.currentPlayer = 0; // first player's turn again
    }
    rl.question('Please enter a row,column (you may also type save to save the game): ', answer => {
        if (answer == 'save') {//we need some base case, for recursion
            SaveTheGame(settings, activeBoard);

        }
        else {
            return rl.close(); //closing RL and returning from function.
            console.log('Got it! Your answer was:  ' + answer + '  "', playerLetters[settings.currentPlayer], '"');

            var grid = answer.split(',');
            playerMoved((parseInt(grid[0]) - 1), parseInt((grid[1]) - 1), playerLetters[settings.currentPlayer]);

            rl.close();
            settings.currentPlayer++;
            recursiveAsyncReadLine();
        }
    });
};

function checkForWinner(board, player){
    if (checkRows(board, player) || checkDiagonals(board, player) || checkColumns(board, player)) {
        console.log('user has won');
    } else {
        console.log('not a winner');
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

function checkDiagonals(board, player){
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

function tieCheck(board, players){

}

function saveGame() {
    console.log('save game has ran');
}


/************************************************************************************/

function main(){
  console.log('Welcome to Advanced Customized Tic-Tac-Toe');
  console.log(
    '                  |   |   \n' +
    '               ---+---+--- \n' +
    '                  |   |   \n' +
    '               ---+---+--- \n' +
    '                  |   |   \n');
	
	StartGameQuestions();
}