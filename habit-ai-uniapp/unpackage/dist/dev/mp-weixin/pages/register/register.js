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
        // 添加 openId 字段
      },
      phone: "",
      password: "",
      betaCode: "",
      aiCharacterName: "default",
      // 添加默认 AI 角色
      aiRoles: [
        { label: "温柔姐姐", value: "gentle" },
        { label: "严厉哥哥", value: "strict" },
        { label: "毒舌", value: "sharp_tongue" }
      ]
    };
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
          common_vendor.index.__f__("error", "at pages/register/register.vue:136", "获取用户信息失败：", err);
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
    async handleRegister() {
      if (!this.userInfo.avatarUrl) {
        common_vendor.index.showToast({
          title: "请先选择头像",
          icon: "none"
        });
        return;
      }
      if (!this.userInfo.nickName) {
        common_vendor.index.showToast({
          title: "请输入昵称",
          icon: "none"
        });
        return;
      }
      if (!this.phone || !/^1\d{10}$/.test(this.phone)) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号",
          icon: "none"
        });
        return;
      }
      if (!this.password || this.password.length < 6) {
        common_vendor.index.showToast({
          title: "密码不能少于6位",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "注册中..."
      });
      try {
        const registerData = {
          avatarUrl: this.userInfo.avatarUrl,
          nickName: this.userInfo.nickName,
          telephone: this.phone,
          password: this.password,
          wechat_openid: this.userInfo.openId || void 0,
          registration_code: this.betaCode || void 0,
          ai_character_name: this.aiCharacterName
          // 确保这个值被包含在注册数据中
        };
        Object.keys(registerData).forEach((key) => {
          if (registerData[key] === void 0) {
            delete registerData[key];
          }
        });
        const res = await utils_api.request({
          url: "/habit-ai/user/register",
          method: "POST",
          data: registerData
        });
        common_vendor.index.setStorageSync("token", res.token);
        common_vendor.index.setStorageSync("userInfo", {
          avatarUrl: this.userInfo.avatarUrl,
          nickName: this.userInfo.nickName,
          phone: this.phone,
          userId: res.user_id,
          openId: this.userInfo.openId
        });
        common_vendor.index.showToast({
          title: "注册成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
        }, 1500);
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "注册失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    async onChooseAvatar(e) {
      const { avatarUrl } = e.detail;
      this.userInfo.avatarUrl = avatarUrl;
      try {
        common_vendor.index.showToast({
          title: "头像设置成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/register/register.vue:270", "获取 openid 失败：", error);
        common_vendor.index.showToast({
          title: "头像设置成功",
          icon: "success"
        });
      }
    },
    getUserProfile() {
      common_vendor.index.getUserProfile({
        desc: "用于完善会员资料",
        success: (res) => {
          this.userInfo.nickName = res.userInfo.nickName;
          common_vendor.index.showToast({
            title: "昵称设置成功",
            icon: "success"
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/register/register.vue:290", "获取用户信息失败：", err);
          common_vendor.index.showToast({
            title: "获取信息失败",
            icon: "none"
          });
        }
      });
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
    n: common_vendor.f($data.aiRoles, (role, index, i0) => {
      return {
        a: common_vendor.t(role.label),
        b: index,
        c: $data.aiCharacterName === role.value ? 1 : "",
        d: common_vendor.o(($event) => $options.selectRole(role.value), index)
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
