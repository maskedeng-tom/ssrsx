var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "jquery"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onInputPassword = exports.onInputUsername = void 0;
    const jquery_1 = __importDefault(require("jquery"));
    const username = (0, jquery_1.default)('input[name="username"]');
    const password = (0, jquery_1.default)('input[name="password"]');
    const submit = (0, jquery_1.default)('input[name="login"]');
    const check = () => {
        if (username.val() && password.val()) {
            submit.prop('disabled', false);
        }
        else {
            submit.prop('disabled', true);
        }
    };
    check();
    const onInputUsername = (_e) => {
        check();
    };
    exports.onInputUsername = onInputUsername;
    const onInputPassword = (_e) => {
        check();
    };
    exports.onInputPassword = onInputPassword;
});
//# sourceMappingURL=index.js.map