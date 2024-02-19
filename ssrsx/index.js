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
        setTimeout(() => {
            throw new Error('test');
        }, 1000);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi90ZXN0L2NsaWVudC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7SUFBQSxvREFBdUI7SUFFdkIsTUFBTSxRQUFRLEdBQUcsSUFBQSxnQkFBQyxFQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDN0MsTUFBTSxRQUFRLEdBQUcsSUFBQSxnQkFBQyxFQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDN0MsTUFBTSxNQUFNLEdBQUcsSUFBQSxnQkFBQyxFQUFDLHFCQUFxQixDQUFDLENBQUM7SUFFeEMsTUFBTSxLQUFLLEdBQUcsR0FBRyxFQUFFO1FBQ2pCLElBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUM7YUFBSSxDQUFDO1lBQ0osTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUNELFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZCxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNYLENBQUMsQ0FBQztJQUNGLEtBQUssRUFBRSxDQUFDO0lBRVIsTUFBTSxlQUFlLEdBQUcsQ0FBQyxFQUFTLEVBQUUsRUFBRTtRQUNwQyxLQUFLLEVBQUUsQ0FBQztJQUNWLENBQUMsQ0FBQztJQU1PLDBDQUFlO0lBSnhCLE1BQU0sZUFBZSxHQUFHLENBQUMsRUFBUyxFQUFFLEVBQUU7UUFDcEMsS0FBSyxFQUFFLENBQUM7SUFDVixDQUFDLENBQUM7SUFFd0IsMENBQWUifQ==