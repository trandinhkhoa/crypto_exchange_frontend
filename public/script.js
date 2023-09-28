function createWebSocket(path) {
    var protocolPrefix = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';
    return new WebSocket(protocolPrefix + '//' + 'localhost:3000' + path);
}

function updateTable(tableId, data, columns) {
    var table = document.getElementById(tableId);
    table.innerHTML = '';
    var headerRow = document.createElement('tr');
    columns.forEach(column => {
        var th = document.createElement('th');
        th.innerText = column;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
    data.forEach(item => {
        var row = document.createElement('tr');
        columns.forEach(column => {
            var td = document.createElement('td');
            var value = item[column];
            if (!isNaN(value) && column !== 'Timestamp') {  // Check if value is a number and not a Timestamp
                td.innerText = parseFloat(value).toFixed(2);
            } else {
                td.innerText = value;
            }
            row.appendChild(td);
        });
        table.appendChild(row);
    });
}


var currentPriceWs = createWebSocket('/ws/currentPrice');
var currentPriceBuffer = null;
var previousPrice = null;

currentPriceWs.onmessage = function(event) {
    currentPriceBuffer = event.data;  // Store new price in buffer
};

setInterval(function() {
    if (currentPriceBuffer !== null) {  // Check if there's a new price in buffer
        var priceElement = document.getElementById('currentPrice');
        var price = parseFloat(currentPriceBuffer);
        currentPriceBuffer = null;  // Clear the buffer

        if (!isNaN(price)) {  // Check if price is a number
            priceElement.innerText = price.toFixed(2);

            if (previousPrice !== null) {  // Check if there's a previous price to compare
                if (price > previousPrice) {
                    priceElement.style.color = 'green';
                } else if (price < previousPrice) {
                    priceElement.style.color = 'red';
                }
            }

            previousPrice = price;  // Update previous price for next comparison
        } else {
            priceElement.innerText = currentPriceBuffer;  // If not a number, just display the text
            priceElement.style.color = '';  // Reset color
        }
    }
}, 200);


var lastTradesWs = createWebSocket('/ws/lastTrades');
lastTradesWs.onmessage = function(event) {
    var data = JSON.parse(event.data);
    updateTable('lastTradesTable', data, ['Price', 'Size', 'Timestamp']);
};

var bestSellsWs = createWebSocket('/ws/bestSells');
bestSellsWs.onmessage = function(event) {
    var data = JSON.parse(event.data).reverse();
    updateTable('bestSellsTable', data, ['Price', 'Volume']);
};

var bestBuysWs = createWebSocket('/ws/bestBuys');
bestBuysWs.onmessage = function(event) {
    var data = JSON.parse(event.data);
    updateTable('bestBuysTable', data, ['Price', 'Volume']);
};
