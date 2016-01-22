var ellipsis = require('../ellipsis');
var assert = require('node-assertthat');
var scaffoldingTemplate = require('html!./scaffolding.html');
var style = require('style/useable!css!./style.css');
describe('ellipsis-overflow', function () {
    var oneLine;
    var happyPath;
    beforeEach(function () {
        document.body.innerHTML = scaffoldingTemplate;
        style.use();
        oneLine = document.getElementById("one-line");
        happyPath = document.getElementById("happy-path");
    });
    afterEach(function () {
        style.unuse();
    })
    it("content can be tested", function () {
        assert(happyPath, "test element exists");
        assert(happyPath.offsetHeight > 0, "test element has a height");
        assert.that(happyPath.scrollHeight, is.greaterThan(happyPath.offsetHeight), "test element is scrollable");
    });
    it("reduces scrollHeight", function () {
        var beforeScrollHeight = happyPath.scrollHeight;
        ellipsis(happyPath);
        assert.that(beforeScrollHeight, is.greaterThan(happyPath.scrollHeight));
    });
    it("test one-liner", function () {
        ellipsis(oneLine);
        // "scrollHeight is less than offsetHeight"
        assert.that(oneLine.scrollHeight, is.lessThan(oneLine.offsetHeight));
    });
    it("test zero height", function () {
        var zeroHeight = document.getElementById("zero-height");
        ellipsis(zeroHeight);
        assert.that(oneLine.offsetHeight, is.greaterThan(zeroHeight.scrollHeight), "zero height element scroll height is less than a line");
    });
    it("what happens when overflow:visible is set", function () {
        var noOverflow = document.getElementById("no-overflow");
        ellipsis(noOverflow);
        assert.that(noOverflow.offsetHeight, is.lessThan(noOverflow.scrollHeight), "scroll height is greater than offset height, because we don't have overflow:scroll");
    });
});
