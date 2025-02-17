"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      userInfo: {
        avatarUrl: "",
        nickName: ""
      },
      aiRoles: ["助手", "教练", "朋友", "专家"],
      selectedRoleIndex: 0
    };
  },
  onLoad() {
    this.loadUserInfo();
    this.loadAISettings();
  },
  methods: {
    loadUserInfo() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo) {
        this.userInfo = userInfo;
      }
    },
    loadAISettings() {
      const aiRole = common_vendor.index.getStorageSync("aiRole");
      if (aiRole) {
        const index = this.aiRoles.indexOf(aiRole);
        if (index !== -1) {
          this.selectedRoleIndex = index;
        }
      }
    },
    onRoleChange(e) {
      this.selectedRoleIndex = e.detail.value;
      common_vendor.index.setStorageSync("aiRole", this.aiRoles[this.selectedRoleIndex]);
      common_vendor.index.showToast({
        title: "AI角色已更新",
        icon: "success"
      });
    },
    onFeedback() {
      common_vendor.index.showModal({
        title: "意见反馈",
        content: "请通过以下邮箱联系我们：\nsupport@habitai.com",
        showCancel: false
      });
    },
    onLogout() {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.clearStorageSync();
            common_vendor.index.reLaunch({
              url: "/pages/index/index"
            });
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.userInfo.avatarUrl || "/static/default-avatar.png",
    b: common_vendor.t($data.userInfo.nickName || "未设置昵称"),
    c: common_vendor.t($data.aiRoles[$data.selectedRoleIndex]),
    d: $data.selectedRoleIndex,
    e: $data.aiRoles,
    f: common_vendor.o((...args) => $options.onRoleChange && $options.onRoleChange(...args)),
    g: common_vendor.o((...args) => $options.onFeedback && $options.onFeedback(...args)),
    h: common_vendor.o((...args) => $options.onLogout && $options.onLogout(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/settings.js.map
