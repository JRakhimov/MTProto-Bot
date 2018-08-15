const { MTProtoConfig } = require("../../config");

exports.adminMiddleware = function() {
  return (ctx, next) => {
    const chatID = ctx.Helper.getChatID(ctx);

    return ctx.Database.ref(MTProtoConfig.sessionPath)
      .once("value")
      .then(response => response.val())
      .then(authData => {
        if (ctx.chat.type === "private" && ctx.Helper.isAdmin(chatID)) {
          if (authData != null && authData.signedIn == true) {
            return next(ctx);
          } else if (ctx.message.text !== "🎫 Log in") {
            return ctx.Helper.authKeyboard(
              ctx,
              "We detected that you are not logged, " +
                "please log in with command => 🎫 Log in"
            );
          } else {
            return next(ctx);
          }
        }
      });
  };
};
