"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const common_assets = require("../../common/assets.js");
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
      selectedRoleIndex: 0,
      // 添加逗号
      showQrCard: false,
      // 添加 showQrCard
      isClosingDown: false,
      isDragging: false,
      startY: 0,
      currentY: 0
    };
  },
  computed: {
    ai_character_names() {
      return this.aiCharacters.map((char) => char.name);
    },
    currentCharacterName() {
      var _a;
      if (this.aiCharacters.length === 0)
        return "加载中...";
      return ((_a = this.aiCharacters[this.selectedRoleIndex]) == null ? void 0 : _a.name) || "请选择角色";
    },
    // 添加 formattedDate 计算属性
    formattedDate() {
      const now = /* @__PURE__ */ new Date();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      const weekDay = weekDays[now.getDay()];
      return `${month}月${date}日 ${weekDay}`;
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
        common_vendor.index.__f__("error", "at pages/settings/settings.vue:179", "加载AI角色失败:", error);
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
      this.showQrCard = true;
    },
    onLogout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("userInfo");
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.removeStorageSync("habits");
            common_vendor.index.removeStorageSync("aiCharacters");
            common_vendor.index.clearStorageSync();
            common_vendor.index.reLaunch({
              url: "/pages/login/login"
            });
          }
        }
      });
    },
    handleTouchStart(e) {
      this.startY = e.touches[0].clientY;
      this.isDragging = true;
      e.stopPropagation();
    },
    handleTouchMove(e) {
      if (!this.isDragging)
        return;
      this.currentY = e.touches[0].clientY;
      e.preventDefault();
      e.stopPropagation();
    },
    handleTouchEnd(e) {
      if (!this.isDragging)
        return;
      const dragDistance = this.currentY - this.startY;
      if (dragDistance > 100) {
        this.closeQrCard();
      }
      this.isDragging = false;
      this.startY = 0;
      this.currentY = 0;
      e.stopPropagation();
    },
    closeQrCard() {
      this.isClosingDown = true;
      setTimeout(() => {
        this.showQrCard = false;
        this.isClosingDown = false;
      }, 500);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.userInfo.avatar_url || "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
    b: common_vendor.t($data.userInfo.nickname),
    c: common_vendor.t($options.currentCharacterName),
    d: $data.selectedRoleIndex,
    e: $options.ai_character_names,
    f: common_vendor.o((...args) => _ctx.onRoleChange && _ctx.onRoleChange(...args)),
    g: common_vendor.o((...args) => $options.onPrivacy && $options.onPrivacy(...args)),
    h: common_vendor.o((...args) => $options.onFeedback && $options.onFeedback(...args)),
    i: common_vendor.o((...args) => $options.onLogout && $options.onLogout(...args)),
    j: $data.showQrCard
  }, $data.showQrCard ? {
    k: common_vendor.t($options.formattedDate),
    l: common_assets._imports_0,
    m: common_vendor.n($data.showQrCard && "slide-in"),
    n: common_vendor.n($data.isClosingDown && "slide-out-down"),
    o: common_vendor.n($data.isDragging && "dragging"),
    p: common_vendor.s(_ctx.dragStyle),
    q: common_vendor.o(() => {
    }),
    r: common_vendor.o((...args) => $options.handleTouchStart && $options.handleTouchStart(...args)),
    s: common_vendor.o((...args) => $options.handleTouchMove && $options.handleTouchMove(...args)),
    t: common_vendor.o((...args) => $options.handleTouchEnd && $options.handleTouchEnd(...args)),
    v: common_vendor.o((...args) => $options.closeQrCard && $options.closeQrCard(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/settings.js.map
