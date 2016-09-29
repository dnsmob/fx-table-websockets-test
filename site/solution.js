if (typeof require !== 'undefined') {
    // This is not really required, but means that changes to index.html will cause a reload.
    require('./index.html');
    // Apply the styles in style.css to the page.
    require('./style.css');
}

if (typeof global !== 'undefined') {
    // Change this to get detailed logging from the stomp library
    global.DEBUG = false
}





this.Test = (function () {

    function Test() {
        this.url = "ws://localhost:8011/stomp";
        this.pairs = [];
        this.sparkles = {};
        this.sparkBuffer = 0;
        this.sparkRenderInt = 0;
        this.renderInt = 0;

        this.table = document.getElementById('table');
    }

    Test.prototype.connectClient = function () {
        this.client = Stomp.client(this.url);
        this.client.connect({}, this.connectCallback.bind(this), function (error) {
            alert(error.headers.message);
        });

        this.client.debug = function (msg) {
            if (global.DEBUG) {
                console.info(msg)
            }
        }
    }

    Test.prototype.connectCallback = function () {
        this.onSocketsReady();
        this.startTimers();
    };

    Test.prototype.onSocketsReady = function () {
        // unhide table
        this.table.style.display = '';

        // listen for updates
        this.subscribed = this.client.subscribe("/fx/prices", this.onUpdateReceived.bind(this));
    };

    Test.prototype.onUpdateReceived = function (obj) {
        var rawObj = JSON.parse(obj['body']); // only param body is coming as a string
        var index = this.pairs.map(function (mapped) { return mapped.name; }).indexOf(rawObj.name); // check if pair exists in array
        if (index < 0) {
            // save pair and update table
            var row = this.addRow();
            rawObj['spark'] = new Sparkline(row.cells[row.cells.length - 1]); // save ref to spark in obj array
            this.pairs.push(rawObj);

            // create initial sparkle values array
            this.sparkles[rawObj['name']] = [];
            rawObj['spark'].draw([0, 0]);

            // immediately render newly added pair
            this.render();
        }
        else {
            // update pair values
            var pair = this.pairs[index];
            var keys = Object.keys(pair);
            for (var key in keys) {
                var keyValue = keys[key];
                if (typeof rawObj[keyValue] !== 'undefined') {
                    pair[keyValue] = rawObj[keyValue];
                }
            }
        }
        // render(); // calling render on every update makes it very jumpy -- using 1 sec interval feels better
    };

    Test.prototype.sort = function () {
        this.pairs = this.pairs.sort(function (pairA, pairB) {
            if (pairA.lastChangeBid < pairB.lastChangeBid) {
                return 1;
            }
            else if (pairA.lastChangeBid > pairB.lastChangeBid) {
                return -1;
            }
            return 0;
        });
    };

    Test.prototype.addRow = function () {
        var row = this.table.insertRow(-1); // insert row at the end
        for (var count = 0, len = this.table.rows[0].cells.length; count < len; ++count) {
            row.insertCell(count);
        }
        return row;
    };

    Test.prototype.render = function () {
        this.sort(); // sort before rendering

        var rows = this.table.rows;
        for (var row = 1, len = rows.length; row < len; ++row) {
            var pair = this.pairs[row - 1];
            var keys = Object.keys(pair);
            for (var key in keys) {
                var keyValue = keys[key];
                var cellIndex = this.cellIndexByKey(keyValue);
                var cell = rows[row].cells[cellIndex];
                if (cellIndex < keys.length - 1) {
                    // update cell text
                    cell.innerHTML = pair[keyValue];
                }
                else {
                    // move spark to this row
                    cell.appendChild(pair[keyValue].canvas);
                }
            }
        }
    };

    Test.prototype.cellIndexByKey = function (name) {
        var index = 0;

        switch (name) {
            case 'name':
                index = 0;
                break;
            case 'bestBid':
                index = 1;
                break;
            case 'bestAsk':
                index = 2;
                break;
            case 'lastChangeBid':
                index = 3;
                break;
            case 'lastChangeAsk':
                index = 4;
                break;
            case 'openBid':
                index = 5;
                break;
            case 'openAsk':
                index = 6;
                break;
            case 'spark':
                index = 7;
                break;
        }
        return index;
    };

    Test.prototype.startTimers = function () {
        // update cell values
        this.renderInt = setInterval(this.render.bind(this), 1000);

        // save sparkle values for each pair
        this.sparkBuffer = setInterval(function () {
            for (var key in this.sparkles) { // ignoring hasOwnProperty on purpose! :)
                var pair = this.pairs[this.pairs.map(function (mapped) { return mapped.name; }).indexOf(key)];
                this.sparkles[key].push((pair.bestBid + pair.bestAsk) / 2);
            }
        }.bind(this), 250);

        this.sparkRenderInt = setInterval(function () {
            // render sparkles
            for (var index in this.pairs) {
                var pair = this.pairs[index];
                pair['spark'].draw(this.sparkles[pair['name']]);
            }

            // cleanup values for fresh 30 secs batch
            for (var key in this.sparkles) {
                this.sparkles[key] = [];
            }
        }.bind(this), 30000);
    };

    return Test;

} ());




