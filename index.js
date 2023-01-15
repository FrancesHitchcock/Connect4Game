import { updateStylesheet, highlightMessage, lowlightMessage, endGame } from "./utils.js"

const board = document.getElementById("board")
const slots = document.getElementById("slots")
const messageContainer = document.getElementById("message-container")
const uiForm = document.getElementById("ui-form")
const numberText = document.getElementById("number-text")

let boardActive = true
let player1 = true
let hasWinner = false
let boardData = []

let boardSize = 7
let discsToWin = 4
let player1Name = ""
let player2Name = ""

uiForm.addEventListener("submit", e => {
    handleButtonClick(e)
})

document.addEventListener("click", e => {
    if(e.target.dataset.columnindex) {
        handleColumnClick(e.target.dataset.columnindex)
    }
})

// the start game button is clicked
function handleButtonClick(e){
    e.preventDefault()

    // ensure player names are capitalised
    let name1 = document.getElementById("name1").value
    name1 = name1.charAt(0).toUpperCase() + name1.slice(1)
    let name2 = document.getElementById("name2").value
    name2 = name2.charAt(0).toUpperCase() + name2.slice(1)

    // the size of the board and the number of connected discs required to win are assigned to the variables
    boardSize = parseInt(document.getElementById("board-size").value)
    discsToWin = parseInt(document.getElementById("line-length").value)

    // board size must be greater than number of connected discs required to win
    if(boardSize > discsToWin){
        
        // randomly assign player names to order of play
        const rand = Math.floor(Math.random() * 2)
        
            if(rand === 0){
            player1Name = name1
            player2Name = name2
        }
        else{
            player1Name = name2
            player2Name = name1
        }

        //game title reflects the number of connected discs required to win
        numberText.textContent = `${discsToWin}`

        // render the board according to the dimensions selected by the players
        updateStylesheet(board, slots, boardSize)
        getBoardData()
        renderBoard()

        uiForm.reset()
        uiForm.classList.remove("flex")
        uiForm.classList.add("hidden")
        messageContainer.textContent = `You go first, ${player1Name}`
        lowlightMessage(messageContainer)
    }
    else{
        messageContainer.textContent = "Discs to win must be less than board size."
        highlightMessage(messageContainer)
    }
}

// click on a column or slot to "drop" disc 
function handleColumnClick(column){
    const messagesArray = ["Your turn", 
        "You go next", 
        "Now it's you", 
        "Go for it", 
        "You can do this", 
        "You've got this", 
        "It's your turn", 
        "Now you", 
        "Get on with it",
        "Off you go",
        "Your turn next"]

    // get random message for each new turn
    const encouragingMessage = messagesArray[Math.floor(Math.random() * messagesArray.length)]

    if(boardActive){
        // swap player names
        let currentPlayer = player1 === true ? player2Name : player1Name
        messageContainer.textContent = `${encouragingMessage}, ${currentPlayer}!`
        lowlightMessage(messageContainer)

        // create temporary column to determine whether "stack" is full
        let tempColumn = []
        boardData.forEach(row =>{
            tempColumn.push(row[column])
        })

        const stackFull = tempColumn.every(square => {
            return square.occupied === true
        })

        // if "stack" is not full the disc falls to the bottom, the board is rendered
        // and the game status is determined. Player is swapped.
        if(!stackFull){
            const targetDiscObj = tempColumn.findLast(square => {
                return square.occupied === false
            })
        
            targetDiscObj.color = player1 ? "red" : "yellow"
            targetDiscObj.owner = player1 ? "player 1" : "player 2"
            targetDiscObj.occupied = true
        
            renderBoard()
            checkForWinner()
            checkForStalemate()
        
            player1 === true ? player1 = false : player1 = true
        }
        // if stack is full display message
        else{
            messageContainer.textContent = "This stack is full, try another slot"
            highlightMessage(messageContainer)
        }
    }
}

function checkForStalemate(){
   let occupiedSquares = []

    boardData.forEach(row => {
        row.forEach(square => {
            if(square.occupied === true){
                occupiedSquares.push(square)
            }
        })
    })

    if(occupiedSquares.length === boardSize * boardSize && hasWinner === false){
        messageContainer.textContent = "No winner this time!"
        highlightMessage(messageContainer)
    }
}

// for every occupied square check for winning number of consecutive discs in rows, columns and diagonals in turn
function checkForWinner(){
    for(let i = 0; i < boardSize; i++){
        for(let j = 0; j < boardSize; j++){

            const targetSquare = boardData[i][j]
            let testOwner = targetSquare.owner

            if(targetSquare.occupied){
                checkRows(i, j, testOwner)
                if(!hasWinner){
                    checkColumns(i, j, testOwner)
                }
                if(!hasWinner){
                    checkTlToBrDiagonals(i, j, testOwner)
                }
                if(!hasWinner){
                checkTrToBlDiagonals(i, j, testOwner)
                }
            }
        }
    }
}

// each of the following four checks includes a test to ensure the only data being checked is inside the boardData matrix.
// The checkAccumulator function is called to determine whether the number of individually-owned discs from each 
// checking function is the same as the number of connected discs required to win.
function checkRows(i, j, testOwner){
    let accumulator = 0
    for(let k = 0; k < discsToWin; k++){
        if(i < boardSize && j + k < boardSize && boardData[i][j + k].owner === testOwner ){ 
            accumulator++
        }
    }
    checkAccumulator(accumulator, testOwner)
}

function checkColumns(i, j, testOwner){
    let accumulator = 0
    for(let k = 0; k < discsToWin; k++){
        if(i + k < boardSize && j < boardSize && boardData[i + k][j].owner === testOwner ){
            accumulator++
        }
    }
    checkAccumulator(accumulator, testOwner)
}

function checkTlToBrDiagonals(i, j, testOwner){
    let accumulator = 0
    for(let k = 0; k < discsToWin; k++){
        if(i + k < boardSize && j + k < boardSize && boardData[i + k][j + k].owner === testOwner ){
            accumulator++
        }
    }
    checkAccumulator(accumulator, testOwner, discsToWin)
}

function checkTrToBlDiagonals(i, j, testOwner){
    let accumulator = 0
    for(let k = 0; k < discsToWin; k++){
        if(i + k < boardSize && j - k >= 0 && boardData[i + k][j - k].owner === testOwner ){
            accumulator++
        }
    }
    checkAccumulator(accumulator, testOwner)
}

function checkAccumulator(accumulator, testOwner){
    if(accumulator === discsToWin){
        hasWinner = true
        endGame(testOwner, player1Name, player2Name, messageContainer)
        boardActive = false
    }
}

// build the boardData nested arrays representing rows and columns
function getBoardData(){
    boardData = []
    for(let rows = 0; rows < boardSize; rows++){
        let tempRow = []
        for(let columns = 0; columns < boardSize; columns++){
            tempRow.push({
                row: `${rows}`,
                column: `${columns}`,
                occupied: false,
                owner: "",
                color: "grey",
            })
        }
        boardData.push(tempRow)
    }
}

// build the html
function getBoardHtml(){
    let boardHtml = ""

    boardData.forEach(boardRow => {
        boardRow.forEach(square => {
            boardHtml += `
            <div class="square" data-columnindex="${square.column}">
                <div class="disc" style="background: ${square.color}" data-columnindex="${square.column}"></div>
            </div>`
        })
    })
    return boardHtml 
}

function getSlotsHtml(){
    let slotsHtml = ""
    for(let columns = 0; columns < boardSize; columns++){
        slotsHtml += `
        <div class="slot" data-columnindex="${columns}"></div>`
    }
    return slotsHtml
}

// attach the html to the elements as innerHTML to render the game board
function renderBoard(){
    board.innerHTML = getBoardHtml()
    slots.innerHTML = getSlotsHtml()
}

updateStylesheet(board, slots, boardSize)
getBoardData()
renderBoard()


