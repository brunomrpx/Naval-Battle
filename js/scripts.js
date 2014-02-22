try {
/*
* Definição de variáveis globais
*/
var divContent = document.getElementById("content"),
	divInteraction = document.getElementById("interaction"),
	divMachineGameBoard = document.getElementById("machineGameBoard"),
	divPlayerGameBoard = document.getElementById("playerGameBoard"),
	divStartGame = document.getElementById("startGame"),
	divPlayerPoints = document.getElementById("playerPoints"),
	divMachinePoints = document.getElementById("machinePoints"),
	machineTable = document.getElementById("machineTable"),
	playerTable = document.getElementById("playerTable"),
	gameStarted = false,
	gameOver = false;

/*
* Objeto para manipulação do tabuleiro
*/
var GameBoard = function() {	
	var ships = 10;
	this.points = 10;
	this.letters = "ABCDEFGHIJ";	
	this.gameBoardTable = "";
	this.result = document.createElement("span");; 

	/*
	* Cria a estrutura do tabuleiro
	*/
	this.create = function() {		
		this.gameBoardTable = document.createElement("table");

		var 
			tr = document.createElement("tr"),
			td = document.createElement("td");		

		td.className = "coordinates";
		tr.appendChild(td);
		for (var i = 0; i <= 9; i++) {
			td = document.createElement("td");		
			td.className = "coordinates";	
			td.innerHTML = this.numberToLetter(i);			
			tr.appendChild(td);
		}
		this.gameBoardTable.appendChild(tr);

		for (var i = 0; i <= 9; i++) {
			tr = document.createElement("tr");
			td = document.createElement("td");
			td.className = "coordinates";
			td.innerHTML = i;			
			tr.appendChild(td);
			for (var j = 0; j <= 9; j++) {
				td = document.createElement("td");
				td.id = i + this.numberToLetter(j);				
				tr.appendChild(td);
			}
			this.gameBoardTable.appendChild(tr);
		}
		
		return this.gameBoardTable;
	};

	/*
	* Cria o tabuleiro com as especificações para interação do jogador
	*/
	this.createPlayerGameBoard = function() {
		this.create().id = "playerTable";
		var 
			cells = this.gameBoardTable.getElementsByTagName("td"),
			insertShip = this.insertShip;

		for (var i = 0; i < cells.length; i++) {						
			cells[i].onclick = function() {
				insertShip(this);				
			}						
		}

		return this.gameBoardTable;
	};

	/*
	* Cria um tabuleiro com as embarcações posicionadas aleatóriamente
	*/
	this.createMachineGameBoard = function() {
		this.create().id = "machineTable";
		var 
			cells = Array(),
			cell,
			canInsert,
			i = 0;

		while (i < 10) {
			canInsert = true;	
			cell = this.getRandomCell();

			if (i != 0) {				
				for (var j = 0; j < cells.length; j++) {					
					if (cells[j].className == cell.className) {
						canInsert = false;
						continue;
					}					
				}
			}

			if (canInsert) {
				cell.className = "ship";
				cells.push(cell);
				i++;
			}
		}		

		return this.gameBoardTable;
	};

	/*
	* Cria o tabuleiro inimigo para interação do jogador
	*/
	this.createDefaultGameBoard = function(baseGameBoard, playerGameBoard) {
		this.create();
		var 
			lines = this.gameBoardTable.getElementsByTagName("tr"),
			playerTurn = this.playerTurn,
			machineTurn = this.machineTurn,
			defaultGameBoard = this;

		for (var i = 0; i < lines.length; i++) {			
			cells = lines[i].getElementsByTagName("td");
			for (var j = 0; j < cells.length; j++) {
				if (cells[j].innerHTML == "" && cells[j].id != "") {					
					cells[j].onclick = function() {
						playerTurn(defaultGameBoard, baseGameBoard, this, playerGameBoard);											
					}
				}
			}
		}

		return this.gameBoardTable;
	};

	/*
	* Faz a jogada da máquina e atualiza o tabuleiro indicado
	*/
	this.machineTurn = function(playerGameBoard) {
		var 
			cell,
			flag = true;

		do {
			cell = playerGameBoard.getRandomCell()

			if (cell.className == "ship") {
				cell.className = "bomb";
				playerGameBoard.points--;
				break;
			} else if (cell.className == "") {				
				cell.className = "water";
				break;
			} 

		} while(flag);

	};

	/*
	* Faz a jogada do computador e atualiza o tabuleiro indicado
	*/
	this.playerTurn = function(defaultGameBoard, machineGameBoard, cell, playerGameBoard) {
		if (!gameOver && playerGameBoard.result.className == "") {
			var
				number = cell.id.charAt(0),
				letter = cell.id.charAt(1),
				target = machineGameBoard.getCell(number, letter),
				cellDefault = defaultGameBoard.getCell(number, letter);								

			if(cell.className != "water" && cell.className != "bomb") {
				if (target.className == "ship") {			
					cell.className = "bomb";	
					
					playerGameBoard.result.className = "bomb-message";
					playerGameBoard.result.innerHTML = "Acertou!";					
													
					machineGameBoard.points--;												
				} else if (target.className == "") {
					cell.className = "water"		
					playerGameBoard.result.className = "water-message";
					playerGameBoard.result.innerHTML = "Água!";		
					
				} 	

				divMachineGameBoard.insertBefore(playerGameBoard.result, machineTable);
				setTimeout(function() {
					divMachineGameBoard.removeChild(playerGameBoard.result);
					playerGameBoard.result.className = "";
				},600);	
				
				playerGameBoard.machineTurn(playerGameBoard);						
			}
						
		}
	};

	/*
	* Retorna uma célula aleatória
	*/
	this.getRandomCell = function() {
		var
			number,
			letter;
		number = (Math.random() * 9).toFixed(0);
		letter = (Math.random() * 9).toFixed(0);			
		letter = this.numberToLetter(letter);

		return this.getCell(number, letter);
	};

	/*
	* Retorna determinada célula conforme as coordenadas indicadas
	*/
	this.getCell = function(number, letter) {	
		var 
			id = number + letter,	
			cells,	
			lines = this.gameBoardTable.getElementsByTagName("tr");

		for (var i = 0; i < lines.length; i++) {			
			cells = lines[i].getElementsByTagName("td");
			for (var j = 0; j < cells.length; j++) {
				if (cells[j].id == id) {
					return cells[j];
				}
			}
		}

		return false;
	};

	/*
	* Insere a embarcação na célula indicada
	*/
	this.insertShip = function(cell) {	
		if (!gameStarted) {
			if (cell.className == "" && ships > 0 && cell.id != "") {												
				cell.className = "ship";
				ships--;			
			} else if (cell.className == "ship") {			
				cell.className = "";
				ships++;
			}			

			if (ships == 0) {
				divStartGame.style.display = "block";
			} else {
				divStartGame.style.display = "none";
			}	
		}
	};
	
	/*
	* Retorna a letra corresponde ao número indicado
	*/
	this.numberToLetter = function(number) {
		if (number >= 0 && number <= this.letters.length) {
			return this.letters.charAt(number);
		}

		return false;
	};

	/*
	* Retorna o número correspondente a letra indicada
	*/
	this.letterToNumber = function(letter) {		
		for (var i = 0; i < this.letters.length; i++) {
			if (this.letters.charAt(i) == letter) {
				return i;
			}
		}
		
		return false;	
	};		

	this.showShips = function(machineGameBoard) {
		var lines = machineGameBoard.getElementsByTagName("tr");		
		for (var i = 0; i < lines.length; i++) {			
			cells = lines[i].getElementsByTagName("td");			
			for (var j = 0; j < cells.length; j++) {
				if (cells[j].className == "ship") {					
					//this.gameBoardTable.getElementById(cells[j].id).className = "ship";
					alert(cells[j].id);
				}
			}
		}
	};
}

/*
* Inicía o fluxo de rodadas do jogo
*/
function startGame(machineGameBoard, playerGameBoard) {	
	gameStarted = true;

	var defaultGameBoard = new GameBoard();
	
		divMachineGameBoard.appendChild(
			defaultGameBoard.createDefaultGameBoard(
				machineGameBoard,
				playerGameBoard	
			)		
		);

		divInteraction.innerHTML = "Escolha uma posição no tabuleiro adversário";

		//defaultGameBoard.showShips(machineGameBoard);

		var run = setInterval(function() {
			divPlayerPoints.innerHTML = playerGameBoard.points;
			divPlayerPoints.style.display = "inline";

			divMachinePoints.innerHTML = machineGameBoard.points;
			divMachinePoints.style.display = "inline";

			if (machineGameBoard.points == 0 || playerGameBoard.points == 0) {					
				var mensagem;

				if (machineGameBoard.points == 0) {
					mensagem = "Vitória!";
				} else if (playerGameBoard.points == 0) {					
					mensagem = "Derrota.";
				}

				gameOver = true;
				divInteraction.innerHTML = mensagem;
				clearInterval(run);				
			}


		}, 10);
}

/*
* Cria o tabuleiro do jogador
*/
var machineGameBoard = new GameBoard();
machineGameBoard.createMachineGameBoard();

var playerGameBoard = new GameBoard();
divPlayerGameBoard.appendChild(playerGameBoard.createPlayerGameBoard());

divStartGame.onclick = function() {
	startGame(machineGameBoard, playerGameBoard);
};
	
} catch(exception) {
	alert(exception.message);
}