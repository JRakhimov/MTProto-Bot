const Router = require("telegraf/router");

const groups = new Router(({ callbackQuery }) => {
  if (!callbackQuery.data) {
    return;
  }

  const parts = callbackQuery.data.split("@");

  return {
    route: parts[0],
    state: {
      groupTitle: parts[1], // D:CODE - team
      groupID: parts[2], // 252362085
      groupHash: parts[3] // 3539057495372134628
    }
  };
});

groups.on("group", ctx => {
  ctx.answerCbQuery(ctx.state.groupTitle);
});

groups.on("addGroup", async ctx => {
  ctx.answerCbQuery(ctx.state.groupTitle);

  ctx.session.tempKeyboard =
    ctx.session.tempKeyboard == null
      ? (await ctx.Helper.DGroups(ctx, "add")).DGroupsKeyboard
      : ctx.session.tempKeyboard;

  const newKeyboard = ctx.Helper.keyboardSwitcher(
    ctx.session.tempKeyboard,
    ctx.state.groupTitle
  );

  await ctx.editMessageReplyMarkup({ inline_keyboard: newKeyboard });
});

groups.on("add", ctx => {
  ctx.answerCbQuery("Save and Add ✨");

  const usersToAdd = [];

  ctx.session.tempKeyboard.forEach(group => {
    if (group[1] != null) {
      const isChecked = group[1].text === "✅";

      if (isChecked) {
        const channelID = group[1].callback_data.split("@")[2];
        const channelHash = group[1].callback_data.split("@")[3];

        const inputUser = {
          _: "inputUser",
          user_id: Number(ctx.session.addContactInfo.user_id),
          access_hash: ctx.session.addContactInfo.access_hash
        };

        usersToAdd.push(
          ctx.MTProto.channelsInviteToChannel(Number(channelID), channelHash, [
            inputUser
          ])
        );
      }
    }
  });

  Promise.all(usersToAdd)
    .then(response => {
      console.log(response);

      delete ctx.session.addContactInfo;
      delete ctx.session.tempKeyboard;

      ctx.editMessageText("Done✨");
    })
    .catch(err => ctx.Helper.errHandler(ctx, err));
});

groups.on("mergeFrom", async ctx => {
  ctx.answerCbQuery(ctx.state.groupTitle);

  const { users } = await ctx.MTProto.channelsGetParticipants(
    ctx.state.groupID,
    ctx.state.groupHash,
    0,
    30
  );

  ctx.session.originUsers = users
    .map(user => {
      if (user.self == null) {
        return {
          _: "inputUser",
          user_id: user.id,
          access_hash: user.access_hash
        };
      }
    })
    .filter(user => user != null);

  const { DGroupsKeyboard } = await ctx.Helper.DGroups(
    ctx,
    "mergeWith",
    ctx.state.groupTitle
  );

  await ctx.deleteMessage();
  await ctx.Helper.replyWithInline(
    ctx,
    "Select the group you want to add the participants:",
    DGroupsKeyboard
  );
});

groups.on("mergeWith", async ctx => {
  ctx.answerCbQuery(ctx.state.groupTitle);

  await ctx.MTProto.channelsInviteToChannel(
    Number(ctx.state.groupID),
    ctx.state.groupHash,
    ctx.session.originUsers
  );

  delete ctx.session.originUsers;

  await ctx.editMessageText("Done✨");
});

module.exports = groups;
