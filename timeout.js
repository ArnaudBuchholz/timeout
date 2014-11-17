(function (self) {
    "use strict";

    // Detects browser
    if ("undefined" !== typeof window) {

        var worker = new Worker("timeout.js");

        worker.addEventListener("message", null);

        window.setTimeout = function () {};

        window.clearTimeout = function (id) {};

        window.setInterval = function () {};

        window.clearInterval = function (id) {};

    } else {

        self.addEventListener("message", null);

    }

}(this));
