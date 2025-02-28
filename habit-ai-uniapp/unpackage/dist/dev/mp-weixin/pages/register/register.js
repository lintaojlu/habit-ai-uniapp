"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const defaultavatar_url = "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0";
const _sfc_main = {
  data() {
    return {
      defaultavatar_url,
      userInfo: {
        avatar_url: "",
        nickname: "",
        openId: ""
      },
      phone: "",
      password: "",
      betaCode: "",
      aiCharacters: [],
      // 添加 AI 角色列表
      selectedCharacterId: "",
      // 添加选中的角色 ID
      ai_character_name: ""
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
            avatar_url: res.userInfo.avatar_url,
            nickname: res.userInfo.nickname
          };
          common_vendor.index.showToast({
            title: "授权成功",
            icon: "success"
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/register/register.vue:133", "获取用户信息失败：", err);
          common_vendor.index.showToast({
            title: "获取信息失败",
            icon: "none"
          });
        }
      });
    },
    onnicknameChange(e) {
      this.userInfo.nickname = e.detail.value;
    },
    // 添加选择角色的方法
    selectRole(value) {
      this.ai_character_name = value;
    },
    async loadAICharacters() {
      try {
        const response = await utils_api.apiService.getAICharacterList();
        if (response.status === "success") {
          common_vendor.index.__f__("log", "at pages/register/register.vue:155", "AI 角色列表:", response.data);
          this.aiCharacters = response.data;
          if (this.aiCharacters.length > 0) {
            this.selectCharacter(this.aiCharacters[0]);
          }
        }
        common_vendor.index.setStorageSync("aiCharacters", response.data);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/register/register.vue:165", "加载 AI 角色失败:", error);
        common_vendor.index.showToast({
          title: "加载角色失败",
          icon: "none"
        });
      }
    },
    selectCharacter(character) {
      this.selectedCharacterId = character.character_id;
      this.ai_character_name = character.name;
    },
    async onChooseAvatar(e) {
      const { avatarUrl } = e.detail;
      this.userInfo.avatar_url = avatarUrl;
      common_vendor.index.__f__("log", "at pages/register/register.vue:183", "选择的头像 URL:", avatarUrl);
      try {
        common_vendor.index.showToast({
          title: "头像设置成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/register/register.vue:193", "获取 openid 失败：", error);
        common_vendor.index.showToast({
          title: "头像设置成功",
          icon: "success"
        });
      }
    },
    async handleRegister() {
      if (!this.userInfo.nickname) {
        common_vendor.index.showToast({
          title: "请输入昵称",
          icon: "none"
        });
        return;
      }
      if (!this.phone) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return;
      }
      const phoneReg = /^1[3-9]\d{9}$/;
      if (!phoneReg.test(this.phone)) {
        common_vendor.index.showToast({
          title: "手机号格式不正确",
          icon: "none"
        });
        return;
      }
      if (!this.password) {
        common_vendor.index.showToast({
          title: "请设置密码",
          icon: "none"
        });
        return;
      }
      if (!this.selectedCharacterId) {
        common_vendor.index.showToast({
          title: "请选择AI角色",
          icon: "none"
        });
        return;
      }
      if (!this.betaCode) {
        common_vendor.index.showToast({
          title: "请输入内测码",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "注册中..."
      });
      try {
        common_vendor.index.__f__("log", "at pages/register/register.vue:258", "注册参数:", {
          telephone: this.phone,
          password: this.password,
          nickname: this.userInfo.nickname,
          avatar_url: this.userInfo.avatar_url,
          wechat_openid: this.userInfo.openId,
          registration_code: this.betaCode,
          ai_character_name: this.ai_character_name
        });
        const res = await utils_api.apiService.register({
          telephone: this.phone,
          password: this.password,
          nickname: this.userInfo.nickname,
          avatar_url: this.userInfo.avatar_url,
          wechat_openid: this.userInfo.openId,
          registration_code: this.betaCode,
          ai_character_name: this.ai_character_name
        });
        common_vendor.index.__f__("log", "at pages/register/register.vue:278", "注册响应:", res);
        if (res.status === "success") {
          common_vendor.index.clearStorageSync();
          this.userInfo.openId = res.openid;
          this.userInfo.nickname = this.userInfo.nickname;
          this.userInfo.avatar_url = this.userInfo.avatar_url;
          this.userInfo.ai_character_name = this.ai_character_name;
          common_vendor.index.setStorageSync("userInfo", this.userInfo);
          common_vendor.index.setStorageSync("telephone", this.phone);
          common_vendor.index.setStorageSync("password", this.password);
          common_vendor.index.setStorageSync("token", res.token);
          common_vendor.index.showToast({
            title: "注册成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.redirectTo({
              url: "/pages/guide/guide"
            });
          }, 1500);
        } else {
          throw new Error(res.message || "注册失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/register/register.vue:311", "注册失败:", error);
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
    b: $data.userInfo.avatar_url || $data.defaultavatar_url,
    c: common_vendor.o((...args) => $options.onChooseAvatar && $options.onChooseAvatar(...args)),
    d: common_vendor.o((...args) => $options.onnicknameChange && $options.onnicknameChange(...args)),
    e: $data.userInfo.nickname,
    f: common_vendor.o(($event) => $data.userInfo.nickname = $event.detail.value),
    g: $data.phone,
    h: common_vendor.o(($event) => $data.phone = $event.detail.value),
    i: $data.password,
    j: common_vendor.o(($event) => $data.password = $event.detail.value),
    k: common_vendor.f($data.aiCharacters, (character, k0, i0) => {
      return {
        a: common_vendor.t(character.icon),
        b: common_vendor.t(character.name),
        c: common_vendor.t(character.description),
        d: character.character_id,
        e: $data.selectedCharacterId === character.character_id ? 1 : "",
        f: common_vendor.o(($event) => $options.selectCharacter(character), character.character_id)
      };
    }),
    l: $data.betaCode,
    m: common_vendor.o(($event) => $data.betaCode = $event.detail.value),
    n: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/register/register.js.map
