function createWebSocket(path) {
    var protocolPrefix = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';
    return new WebSocket(protocolPrefix + '//' + 'localhost:3000' + path);
}

function updateTable(tableId, data, columns) {
    var table = document.getElementById(tableId);
    table.innerHTML = '';
    var headerRow = document.createElement('tr');
    columns.forEach(column => {
        if (column !== 'IsBuyerMaker') {  // Skip IsBuyerMaker column header
            var th = document.createElement('th');
            th.innerText = column;
            headerRow.appendChild(th);
        }
    });
    table.appendChild(headerRow);
    data.forEach(item => {
        var row = document.createElement('tr');
        columns.forEach(column => {
            if (column !== 'IsBuyerMaker') {  // Skip IsBuyerMaker column data
                var td = document.createElement('td');
                var value = item[column];
                if (!isNaN(value) && column !== 'Timestamp') {  // Check if value is a number and not a Timestamp
                    td.innerText = parseFloat(value).toFixed(2);
                } else if (column === 'Timestamp') {
                    var totalMilliseconds = Math.floor(value / 1000000); // Convert nanoseconds to milliseconds

                    // Create a new Date object with the milliseconds
                    var date = new Date(totalMilliseconds);

                    var hours = date.getUTCHours().toString().padStart(2, '0');
                    var minutes = date.getUTCMinutes().toString().padStart(2, '0');
                    var seconds = date.getUTCSeconds().toString().padStart(2, '0');
                    var millis = date.getUTCMilliseconds().toString().padStart(3, '0');

                    var formattedTime = `${hours}:${minutes}:${seconds}.${millis}`;
                    td.innerText = formattedTime;
                } else {
                    td.innerText = value;
                }
                row.appendChild(td);
            }
        });
        // Set the row background color based on the IsBuyerMaker value
        if (tableId === 'lastTradesTable') {
            row.style.backgroundColor = !item.IsBuyerMaker ? '#e6ffe6' : '#ffe6e6';
        }
        table.appendChild(row);
    });
}

var lastTradesWs = createWebSocket('/ws/lastTrades');
lastTradesWs.onmessage = function(event) {
    var data = JSON.parse(event.data);
    updateTable('lastTradesTable', data, ['Price', 'Size', 'IsBuyerMaker', 'Timestamp']);  // Keep IsBuyerMaker here for color coding
};




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

document.getElementById('limitBuyButton').addEventListener('click', function() {
    placeLimitOrder(true);
});

document.getElementById('limitSellButton').addEventListener('click', function() {
    placeLimitOrder(false);
});

document.getElementById('marketBuyButton').addEventListener('click', function() {
    placeMarketOrder(true);
});
document.getElementById('marketSellButton').addEventListener('click', function() {
    placeMarketOrder(false);
});

function placeLimitOrder(isBid) {
    // Gather the input values
    var priceInput = isBid ? document.getElementById('limitBuyPrice') : document.getElementById('limitSellPrice');
    var sizeInput = isBid ? document.getElementById('limitBuyQuantity') : document.getElementById('limitSellQuantity');
    var price = parseFloat(priceInput.value);
    var size = parseFloat(sizeInput.value);

    // Validate the inputs (you can add more validation logic here)
    if (isNaN(price) || isNaN(size)) {
        alert('Invalid price or size');
        return;
    }

    // Prepare the request payload
    var payload = {
        "UserId": "me",  // Hardcoded for now
        "OrderType": "LIMIT",
        "IsBid": isBid,
        "Size": size,
        "Price": price,
        "Ticker": "ETHUSD"  // Hardcoded for now
    };

    // Send the request to place the order
    fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response (you can add more logic here)
        console.log('Order response:', data);
    })
    .catch(error => {
        // Handle errors
        console.log('Error:', error);
    });
}

function placeMarketOrder(isBid) {
    // Gather the input values
    var sizeInput = isBid ? document.getElementById('marketBuyQuantity') : document.getElementById('marketSellQuantity');
    var size = parseFloat(sizeInput.value);

    // Validate the inputs (you can add more validation logic here)
    if (isNaN(size)) {
        alert('Invalid size');
        return;
    }

    // Prepare the request payload
    var payload = {
        "UserId": "me",  // Hardcoded for now
        "OrderType": "MARKET",
        "IsBid": isBid,
        "Size": size,
        "Ticker": "ETHUSD"  // Hardcoded for now
    };

    // Send the request to place the order
    fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response (you can add more logic here)
        console.log('Order response:', data);
    })
    .catch(error => {
        // Handle errors
        console.log('Error:', error);
    });
}

var lastTradesWs = createWebSocket('/ws/lastTrades');
lastTradesWs.onmessage = function(event) {
    var data = JSON.parse(event.data);
    updateTable('lastTradesTable', data, ['Price', 'Size', 'IsBuyerMaker', 'Timestamp']);
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

var userInfoWs = createWebSocket('/ws/userInfo?userId=me');
userInfoWs.onmessage = function(event) {
    var data = JSON.parse(event.data);

    // Get the table body element
    var tableBody = document.getElementById('balanceBody');

    // Clear the existing table body
    tableBody.innerHTML = '';

    // Populate the table with new data
    for (var currency in data.Balance) {
        var row = document.createElement('tr');
        var cell1 = document.createElement('td');
        var cell2 = document.createElement('td');

        cell1.innerText = currency;
        cell2.innerText = data.Balance[currency];

        row.appendChild(cell1);
        row.appendChild(cell2);
        tableBody.appendChild(row);
    }
};


// tab switch
document.addEventListener('DOMContentLoaded', (event) => {
    const tabs = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-pane');

    tabs.forEach((tab) => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active classes from all tabs
            tabs.forEach((t) => {
                t.classList.remove('active');
            });

            // Add active class to clicked tab
            tab.classList.add('active');

            // Hide all tab content
            tabContents.forEach((content) => {
                content.classList.remove('show', 'active');
            });

            // Show clicked tab content
            const target = tab.getAttribute('aria-controls');
            const content = document.getElementById(target);
            content.classList.add('show', 'active');
        });
    });
});