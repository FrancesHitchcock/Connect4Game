
//give the board & slot elements a gridTemplate attribute according to the size of the board
function updateStylesheet(board, slots, boardSize){
    board.style.gridTemplate = `repeat(${boardSize}, 1fr) / repeat(${boardSize}, 1fr)`
    slots.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`
}

function highlightMessage(messageContainer){
    messageContainer.style.color = "red"
    messageContainer.style.fontWeight = "bold"
}

function lowlightMessage(messageContainer){
    messageContainer.style.color = "#111"
    messageContainer.style.fontWeight = "normal"
}

function endGame(winner, player1Name, player2Name, messageContainer){
    const winnerName = winner === "player 1" ? player1Name : player2Name
    messageContainer.textContent = `Congratulations, ${winnerName} is the winner!`
    highlightMessage(messageContainer)
}

export {updateStylesheet, highlightMessage, lowlightMessage, endGame}
