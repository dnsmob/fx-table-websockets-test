describe('Test TDD', function () {

    var js;

    beforeEach(function () {
        loadFixtures('fixture.html');
    });

    // check if required table is present
    describe('Check table presence', function () {
        it('html should have #table', function () {
            expect($('table#table')).toExist();
        });
    });

    describe('Check Test class presence', function () {
        it('class should exist', function () {
            expect(Test).toBeDefined();
        });

        it('will be instantiated', function () {
            js = new Test();
            expect(js).toBeDefined();
        });
    });

    describe("Adding a few pairs", function () {
        it("pairs array should be empty", function () {
            expect(js.pairs).toEqual([]);
        });

        it("pairs array should have 1 item", function () {
            js.onUpdateReceived({ "body": '{ "name": "gbpusd", "bestBid": 1.4229080887628205, "bestAsk": 1.457017963108837, "openBid": 1.4453345811628284, "openAsk": 1.4720654188371718, "lastChangeAsk": 0.025831149496755135, "lastChangeBid": 0.00030087662768307766 }' });
            expect(js.pairs.length).toEqual(1);
        });

        it("table should have 2 rows (header + 1 added above)", function () {
            expect(js.table.rows.length).toEqual(2);
        });

        it("pairs array should have 2 item", function () {
            js.onUpdateReceived({ "body": '{"name":"eurchf","bestBid":1.077168172777775,"bestAsk":1.0878802329065045,"openBid":1.073243725882948,"openAsk":1.120556274117052,"lastChangeAsk":0.01232352767281597,"lastChangeBid":0.01414671244799015}' });
            expect(js.pairs.length).toEqual(2);
            console.log(js.pairs)
        });

        it("update previous pair entry", function () {
            var index = js.pairs.map(function (mapped) { return mapped.name }).indexOf('gbpusd');
            expect(js.pairs[index]['bestBid']).toEqual(1.4229080887628205);

            // this only updates the pair (only new pairs call render), therefore doesnt sort the pairs array
            js.onUpdateReceived({ "body": '{ "name": "gbpusd", "bestBid": 1.5, "bestAsk": 1.5, "openBid": 1.4453345811628284, "openAsk": 1.4720654188371718, "lastChangeAsk": 0.025831149496755135, "lastChangeBid": 0.2 }' });
            expect(js.pairs[index]['bestBid']).toEqual(1.5);
        });

        it("table should still have just 2 pair rows + 1 header", function () {
            expect(js.table.rows.length).toEqual(3);
            console.log(js.pairs)
        });

        it("pairs is *unsorted* - eurchf < gbpusd", function () {
            expect(js.pairs[0]['name']).toBe('eurchf');
            expect(js.pairs[1]['name']).toBe('gbpusd');
        });

        it("should have gbpusd in position 0", function () {
            js.sort();
            expect(js.pairs[0]['name']).toBe('gbpusd');
            expect(js.pairs[1]['name']).toBe('eurchf');
        });
    });

});


