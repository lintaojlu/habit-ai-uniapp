"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  data() {
    return {
      userInfo: {
        user_id: "",
        nickname: "",
        avatar_url: "",
        ai_character_name: "",
        telephone: ""
      },
      aiCharacters: [],
      // AI角色列表
      selectedRoleIndex: 0
    };
  },
  computed: {
    aiCharacterNames() {
      return this.aiCharacters.map((char) => char.name);
    },
    currentCharacterName() {
      var _a;
      if (this.aiCharacters.length === 0)
        return "加载中...";
      return ((_a = this.aiCharacters[this.selectedRoleIndex]) == null ? void 0 : _a.name) || "请选择角色";
    }
  },
  onLoad() {
    this.loadUserInfo();
    this.loadAICharacters();
  },
  methods: {
    loadUserInfo() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo) {
        this.userInfo = userInfo;
      }
    },
    async loadAICharacters() {
      try {
        const characters = common_vendor.index.getStorageSync("aiCharacters");
        if (characters) {
          this.aiCharacters = characters;
          if (this.userInfo.ai_character_name) {
            const currentIndex = this.aiCharacters.findIndex(
              (char) => char.name === this.userInfo.ai_character_name
            );
            if (currentIndex !== -1) {
              this.selectedRoleIndex = currentIndex;
            }
          }
        } else {
          const response = await utils_api.apiService.getAICharacterList();
          if (response.status === "success") {
            this.aiCharacters = response.data;
            common_vendor.index.setStorageSync("aiCharacters", response.data);
            if (this.userInfo.ai_character_name) {
              const currentIndex = this.aiCharacters.findIndex(
                (char) => char.name === this.userInfo.ai_character_name
              );
              if (currentIndex !== -1) {
                this.selectedRoleIndex = currentIndex;
              }
            }
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/settings/settings.vue:138", "加载AI角色失败:", error);
        common_vendor.index.showToast({
          title: "加载角色失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    onPrivacy() {
      common_vendor.index.showToast({
        title: "功能开发中",
        icon: "none"
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
              url: "/pages/login/login"
            });
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.userInfo.avatar_url || "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
    b: common_vendor.t($data.userInfo.nickname || "未设置昵称"),
    c: common_vendor.t($options.currentCharacterName),
    d: $data.selectedRoleIndex,
    e: $options.aiCharacterNames,
    f: common_vendor.o((...args) => _ctx.onRoleChange && _ctx.onRoleChange(...args)),
    g: common_vendor.o((...args) => $options.onPrivacy && $options.onPrivacy(...args)),
    h: common_vendor.o((...args) => $options.onFeedback && $options.onFeedback(...args)),
    i: common_vendor.o((...args) => $options.onLogout && $options.onLogout(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/settings.js.map
