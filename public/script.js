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
            td.innerText = item[column];
            row.appendChild(td);
        });
        table.appendChild(row);
    });
}

var currentPriceWs = createWebSocket('/ws/currentPrice');
currentPriceWs.onmessage = function(event) {
    document.getElementById('currentPrice').innerText = event.data;
};

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
