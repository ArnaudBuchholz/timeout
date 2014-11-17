(function (self) {
    "use strict";

    var
        _TIMEOUT    = 0,
        _INTERVAL   = 1,
        _CLEAR      = 2,
        Func        = Function, // Bypass JSHint W054

        _timeoutID = 0,
        _timeouts   = {},
        _intervalID = 0,
        _intervals  = {},

        _worker;

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
            definition[0].apply(window, definition.slice(1));
        }
    }

    function _register(type, map, id, initialArguments) {
        var delay = initialArguments[1] || 0,
            callback = initialArguments[0];
        if ("string" === typeof callback) {
            callback = new Func(callback);
        }
        map[id] = [callback].concat(initialArguments.slice(2));
        _worker.postMessage({
            type: type,
            delay: delay,
            id: id
        });
        return id;
    }

    function _setTimeout() {
        return _register(_TIMEOUT, _timeouts, ++_timeoutID, arguments);
    }

    function _clearTimeout(id) {
        delete _timeouts[id];
        _worker.postMessage({
            type: _TIMEOUT + _CLEAR,
            id: id
        });
    }

    function _setInterval() {
        return _register(_INTERVAL, _intervals, ++_intervalID, arguments);
    }

    function _clearInterval(id) {
        delete _intervals[id];
        _worker.postMessage({
            type: _INTERVAL + _CLEAR,
            id: id
        });
    }

    function _workerMessage(event) {
        var
            type = event.data.type,
            incomingID = event.data.id,
            systemID,
            map,
            clearCmd,
            setCmd;
        if (_INTERVAL === (_INTERVAL & _INTERVAL)) {
            map = _intervals;
            clearCmd = clearInterval;
            setCmd = setInterval;
        } else {
            map = _timeouts;
            clearCmd = clearTimeout;
            setCmd = setTimeout;
        }
        if (_CLEAR === (_CLEAR & type)) {
            systemID = map[incomingID];
            if (undefined !== systemID) {
                clearCmd(systemID);
                delete map[incomingID];
            }
        } else {
            systemID = setCmd(_timeout, event.data.delay, [type, incomingID]);
            map[incomingID] = systemID;
        }
    }

    if ("undefined" !== typeof window) {
        /**
         * The Web Worker does not have access to the window, this is a good
         * condition to detect if we are in the page or in the thread.
         */
        _worker = new Worker("timeout.js");
        _worker.addEventListener("message", _windowMessage);
        window.setTimeout = _setTimeout;
        window.clearTimeout = _clearTimeout;
        window.setInterval = _setInterval;
        window.clearInterval = _clearInterval;
    } else {
        self.addEventListener("message", _workerMessage);
    }

}(this));
