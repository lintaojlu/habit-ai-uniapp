"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const defaultAvatarUrl = "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0";
const _sfc_main = {
  data() {
    return {
      defaultAvatarUrl,
      userInfo: {
        avatarUrl: "",
        nickName: "",
        openId: ""
      },
      phone: "",
      password: "",
      betaCode: "",
      aiCharacters: [],
      // 添加 AI 角色列表
      selectedCharacterId: "",
      // 添加选中的角色 ID
      aiCharacterName: ""
      // 修改默认值为空字符串
    };
  },
  // 添加 created 生命周期钩子
  created() {
    this.loadAICharacters();
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    getUserProfile() {
      common_vendor.wx$1.getUserProfile({
        desc: "用于完善用户资料",
        success: (res) => {
          this.userInfo = {
            avatarUrl: res.userInfo.avatarUrl,
            nickName: res.userInfo.nickName
          };
          common_vendor.index.showToast({
            title: "授权成功",
            icon: "success"
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/register/register.vue:143", "获取用户信息失败：", err);
          common_vendor.index.showToast({
            title: "获取信息失败",
            icon: "none"
          });
        }
      });
    },
    onNicknameChange(e) {
      this.userInfo.nickName = e.detail.value;
    },
    // 添加选择角色的方法
    selectRole(value) {
      this.aiCharacterName = value;
    },
    async loadAICharacters() {
      try {
        const response = await utils_api.apiService.getAICharacterList();
        if (response.status === "success") {
          this.aiCharacters = response.data;
          if (this.aiCharacters.length > 0) {
            this.selectCharacter(this.aiCharacters[0]);
          }
        }
        common_vendor.index.setStorageSync("aiCharacters", response.data);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/register/register.vue:174", "加载 AI 角色失败:", error);
        common_vendor.index.showToast({
          title: "加载角色失败",
          icon: "none"
        });
      }
    },
    selectCharacter(character) {
      this.selectedCharacterId = character.character_id;
      this.aiCharacterName = character.name;
    },
    async onChooseAvatar(e) {
      const { avatarUrl } = e.detail;
      this.userInfo.avatarUrl = avatarUrl;
      common_vendor.index.__f__("log", "at pages/register/register.vue:191", "选择的头像 URL:", avatarUrl);
      try {
        common_vendor.index.showToast({
          title: "头像设置成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/register/register.vue:201", "获取 openid 失败：", error);
        common_vendor.index.showToast({
          title: "头像设置成功",
          icon: "success"
        });
      }
    },
    async handleRegister() {
      common_vendor.index.showLoading({
        title: "注册中..."
      });
      try {
        common_vendor.index.__f__("log", "at pages/register/register.vue:217", "注册参数:", {
          telephone: this.phone,
          password: this.password,
          nickname: this.userInfo.nickName,
          avatar_url: this.userInfo.avatarUrl,
          wechat_openid: this.userInfo.openId,
          registration_code: this.betaCode,
          ai_character_name: this.aiCharacterName
        });
        const res = await utils_api.apiService.register({
          telephone: this.phone,
          password: this.password,
          nickname: this.userInfo.nickName,
          avatar_url: this.userInfo.avatarUrl,
          wechat_openid: this.userInfo.openId,
          registration_code: this.betaCode,
          ai_character_name: this.aiCharacterName
        });
        common_vendor.index.__f__("log", "at pages/register/register.vue:237", "注册响应:", res);
        if (res.status === "success") {
          common_vendor.index.clearStorageSync();
          this.userInfo.openId = res.openid;
          this.userInfo.nickName = this.userInfo.nickName;
          this.userInfo.avatarUrl = this.userInfo.avatarUrl;
          this.userInfo.aiCharacterName = this.aiCharacterName;
          common_vendor.index.setStorageSync("userInfo", this.userInfo);
          common_vendor.index.setStorageSync("token", res.token);
          common_vendor.index.showToast({
            title: "注册成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.reLaunch({
              url: "/pages/index/index"
            });
          }, 1500);
        } else {
          throw new Error(res.message || "注册失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/register/register.vue:275", "注册失败:", error);
        common_vendor.index.showToast({
          title: error.message || "注册失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.userInfo.avatarUrl || $data.defaultAvatarUrl,
    c: common_vendor.o((...args) => $options.onChooseAvatar && $options.onChooseAvatar(...args)),
    d: common_vendor.o((...args) => $options.onNicknameChange && $options.onNicknameChange(...args)),
    e: $data.userInfo.nickName,
    f: common_vendor.o(($event) => $data.userInfo.nickName = $event.detail.value),
    g: common_vendor.o((...args) => $options.onNicknameChange && $options.onNicknameChange(...args)),
    h: $data.userInfo.nickName,
    i: common_vendor.o(($event) => $data.userInfo.nickName = $event.detail.value),
    j: $data.phone,
    k: common_vendor.o(($event) => $data.phone = $event.detail.value),
    l: $data.password,
    m: common_vendor.o(($event) => $data.password = $event.detail.value),
    n: common_vendor.f($data.aiCharacters, (character, k0, i0) => {
      return {
        a: common_vendor.t(character.icon),
        b: common_vendor.t(character.name),
        c: common_vendor.t(character.description),
        d: character.character_id,
        e: $data.selectedCharacterId === character.character_id ? 1 : "",
        f: common_vendor.o(($event) => $options.selectCharacter(character), character.character_id)
      };
    }),
    o: $data.betaCode,
    p: common_vendor.o(($event) => $data.betaCode = $event.detail.value),
    q: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/register/register.js.map
