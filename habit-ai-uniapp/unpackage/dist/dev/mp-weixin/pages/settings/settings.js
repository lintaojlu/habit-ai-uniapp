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
      currentY: 0,
      showWechatCard: false,
      isWechatClosingDown: false,
      isWechatDragging: false,
      wechatStartY: 0,
      wechatCurrentY: 0
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
    common_vendor.index.__f__("log", "at pages/settings/settings.vue:174", "[setting] userInfo:", this.userInfo);
    this.loadAICharacters();
  },
  methods: {
    onWechat() {
      this.showWechatCard = true;
    },
    handleWechatTouchStart(e) {
      this.wechatStartY = e.touches[0].clientY;
      this.isWechatDragging = true;
      e.stopPropagation();
    },
    handleWechatTouchMove(e) {
      if (!this.isWechatDragging)
        return;
      this.wechatCurrentY = e.touches[0].clientY;
      e.preventDefault();
      e.stopPropagation();
    },
    handleWechatTouchEnd(e) {
      if (!this.isWechatDragging)
        return;
      const dragDistance = this.wechatCurrentY - this.wechatStartY;
      if (dragDistance > 100) {
        this.closeWechatCard();
      }
      this.isWechatDragging = false;
      this.wechatStartY = 0;
      this.wechatCurrentY = 0;
      e.stopPropagation();
    },
    closeWechatCard() {
      this.isWechatClosingDown = true;
      setTimeout(() => {
        this.showWechatCard = false;
        this.isWechatClosingDown = false;
      }, 500);
    },
    showRolePicker() {
      const picker = this.$refs.rolePicker;
      if (picker) {
        picker.$el.click();
      }
    },
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
        common_vendor.index.__f__("error", "at pages/settings/settings.vue:264", "加载AI角色失败:", error);
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
        title: "您的所有数据仅用于核心功能，不收集、不存储、不共享任何个人信息。",
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
    },
    async onRoleChange(e) {
      const index = e.detail.value;
      const newCharacter = this.aiCharacters[index];
      try {
        const response = await utils_api.apiService.updateUserInfo({
          ai_character_name: newCharacter.name
        });
        if (response.status === "success") {
          const userInfo = common_vendor.index.getStorageSync("userInfo");
          userInfo.ai_character_name = newCharacter.name;
          common_vendor.index.setStorageSync("userInfo", userInfo);
          this.userInfo.ai_character_name = newCharacter.name;
          this.selectedRoleIndex = index;
          common_vendor.index.showToast({
            title: "角色更新成功",
            icon: "success"
          });
        } else {
          throw new Error(response.message || "更新失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/settings/settings.vue:367", "更新角色失败:", error);
        common_vendor.index.showToast({
          title: error.message || "更新失败",
          icon: "none"
        });
        const prevIndex = this.aiCharacters.findIndex(
          (char) => char.name === this.userInfo.ai_character_name
        );
        if (prevIndex !== -1) {
          this.selectedRoleIndex = prevIndex;
        }
      }
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
    f: common_vendor.o((...args) => $options.onRoleChange && $options.onRoleChange(...args)),
    g: common_vendor.o((...args) => $options.onWechat && $options.onWechat(...args)),
    h: common_vendor.o((...args) => $options.onFeedback && $options.onFeedback(...args)),
    i: common_vendor.o((...args) => $options.onPrivacy && $options.onPrivacy(...args)),
    j: common_vendor.o((...args) => $options.onLogout && $options.onLogout(...args)),
    k: $data.showQrCard
  }, $data.showQrCard ? {
    l: common_vendor.t($options.formattedDate),
    m: common_assets._imports_0,
    n: common_vendor.n($data.showQrCard && "slide-in"),
    o: common_vendor.n($data.isClosingDown && "slide-out-down"),
    p: common_vendor.n($data.isDragging && "dragging"),
    q: common_vendor.s(_ctx.dragStyle),
    r: common_vendor.o(() => {
    }),
    s: common_vendor.o((...args) => $options.handleTouchStart && $options.handleTouchStart(...args)),
    t: common_vendor.o((...args) => $options.handleTouchMove && $options.handleTouchMove(...args)),
    v: common_vendor.o((...args) => $options.handleTouchEnd && $options.handleTouchEnd(...args)),
    w: common_vendor.o((...args) => $options.closeQrCard && $options.closeQrCard(...args))
  } : {}, {
    x: $data.showWechatCard
  }, $data.showWechatCard ? {
    y: common_vendor.t($options.formattedDate),
    z: common_assets._imports_1,
    A: common_vendor.n($data.showWechatCard && "slide-in"),
    B: common_vendor.n($data.isWechatClosingDown && "slide-out-down"),
    C: common_vendor.n($data.isWechatDragging && "dragging"),
    D: common_vendor.s(_ctx.wechatDragStyle),
    E: common_vendor.o(() => {
    }),
    F: common_vendor.o((...args) => $options.handleWechatTouchStart && $options.handleWechatTouchStart(...args)),
    G: common_vendor.o((...args) => $options.handleWechatTouchMove && $options.handleWechatTouchMove(...args)),
    H: common_vendor.o((...args) => $options.handleWechatTouchEnd && $options.handleWechatTouchEnd(...args)),
    I: common_vendor.o((...args) => $options.closeWechatCard && $options.closeWechatCard(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/settings.js.map
