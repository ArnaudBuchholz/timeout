(function (self) {
    "use strict";

    var
        _TIMEOUT    = 0,
        _INTERVAL   = 1,

        _timeouts   = {},
        _intervals  = {};

    function _timeout() {
        self.postMessage({
            type: arguments[0],
            id: arguments[1]
        });
    }

    function _windowMessage(event) {
        var type = event.data.type,
            id = event.data.id,
            definition;
        if (_TIMEOUT === type) {
            definition = _timeouts[id];
        } else {
            definition = _intervals[id];
        }
        if (undefined !== definition) {
            definition.callback.apply(window, definition.parameters);
        }
    }

    function _setTimeout() {

    }

    function _clearTimeout(id) {

    }

    function _setInterval() {

    }

    function _clearInterval(id) {

    }

    function _workerMessage(event) {

    }

    if ("undefined" !== typeof window) {
        /**
         * The Web Worker does not have access to the window, this is a good
         * condition to detect if we are in the page or in the thread.
         */
        var worker = new Worker("timeout.js");
        worker.addEventListener("message", _windowMessage);
        window.setTimeout = _setTimeout;
        window.clearTimeout = _clearTimeout;
        window.setInterval = _setInterval;
        window.clearInterval = _clearInterval;
    } else {
        self.addEventListener("message", _workerMessage);
    }

}(this));
