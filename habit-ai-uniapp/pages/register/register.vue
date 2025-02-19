<template>
  <view class="container">
    <view class="header">
      <view class="back-button" @tap="goBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="title">注册账号</text>
    </view>

    <view class="avatar-section">
      <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image class="avatar" :src="userInfo.avatarUrl || defaultAvatarUrl" mode="aspectFill" />
        <text class="tip">点击更换头像</text>
      </button>
      <view class="nickname-wrapper">
        <text class="nickname-label">昵称</text>
        <input 
          type="nickname" 
          class="nickname-input" 
          placeholder="请输入昵称" 
          @change="onNicknameChange"
          v-model="userInfo.nickName"
        />
      </view>
    </view>

    <view class="form-section">
      <view class="input-group">
        <text class="label">昵称</text>
        <input 
          type="nickname" 
          class="input-field" 
          placeholder="请输入昵称" 
          @change="onNicknameChange"
          v-model="userInfo.nickName"
        />
      </view>

      <view class="input-group">
        <text class="label">手机号</text>
        <input 
          class="input-field" 
          type="number" 
          v-model="phone" 
          placeholder="请输入手机号"
          maxlength="11"
        />
      </view>

      <view class="input-group">
        <text class="label">密码</text>
        <input 
          class="input-field" 
          type="password" 
          v-model="password" 
          placeholder="请设置密码"
          maxlength="20"
        />
      </view>

      <view class="input-group">
        <text class="label">选择AI角色</text>
        <view class="radio-group">
          <view 
            v-for="(role, index) in aiRoles" 
            :key="index"
            class="radio-item"
            :class="{ 'radio-item-active': aiCharacterName === role.value }"
            @tap="selectRole(role.value)"
          >
            <text>{{ role.label }}</text>
          </view>
        </view>
      </view>

      <view class="input-group">
        <text class="label">内测码（选填）</text>
        <input 
          class="input-field" 
          type="text" 
          v-model="betaCode" 
          placeholder="如有内测码请输入"
        />
      </view>
    </view>

    <button class="submit-button" @tap="handleRegister">注册</button>
  </view>
</template>

<script>
import { request } from '@/utils/api.js'

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

export default {
  data() {
    return {
      defaultAvatarUrl,
      userInfo: {
        avatarUrl: '',
        nickName: '',
        openId: ''  // 添加 openId 字段
      },
      phone: '',
      password: '',
      betaCode: '',
      aiCharacterName: 'default',  // 添加默认 AI 角色
      aiRoles: [
        { label: '温柔姐姐', value: 'gentle' },
        { label: '严厉哥哥', value: 'strict' },
        { label: '毒舌', value: 'sharp_tongue' }
      ]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    getUserProfile() {
      // 使用微信小程序原生的用户信息接口
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          this.userInfo = {
            avatarUrl: res.userInfo.avatarUrl,
            nickName: res.userInfo.nickName
          }
          
          uni.showToast({
            title: '授权成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('获取用户信息失败：', err)
          uni.showToast({
            title: '获取信息失败',
            icon: 'none'
          })
        }
      })
    },

    onNicknameChange(e) {
      this.userInfo.nickName = e.detail.value
    },

    // 添加选择角色的方法
    selectRole(value) {
      this.aiCharacterName = value
    },

    async handleRegister() {
      if (!this.userInfo.avatarUrl) {
        uni.showToast({
          title: '请先选择头像',
          icon: 'none'
        })
        return
      }
      
      if (!this.userInfo.nickName) {
        uni.showToast({
          title: '请输入昵称',
          icon: 'none'
        })
        return
      }
      
      if (!this.phone || !/^1\d{10}$/.test(this.phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      if (!this.password || this.password.length < 6) {
        uni.showToast({
          title: '密码不能少于6位',
          icon: 'none'
        })
        return
      }

      uni.showLoading({
        title: '注册中...'
      })
      
      try {
        const registerData = {
          avatarUrl: this.userInfo.avatarUrl,
          nickName: this.userInfo.nickName,
          telephone: this.phone,
          password: this.password,
          wechat_openid: this.userInfo.openId || undefined,
          registration_code: this.betaCode || undefined,
          ai_character_name: this.aiCharacterName  // 确保这个值被包含在注册数据中
        }
        
        // 移除所有 undefined 的字段
        Object.keys(registerData).forEach(key => {
          if (registerData[key] === undefined) {
            delete registerData[key]
          }
        })
        
        const res = await request({
          url: '/habit-ai/user/register',
          method: 'POST',
          data: registerData
        })
        
        // 存储用户信息时也保存 openId
        uni.setStorageSync('token', res.token)
        uni.setStorageSync('userInfo', {
          avatarUrl: this.userInfo.avatarUrl,
          nickName: this.userInfo.nickName,
          phone: this.phone,
          userId: res.user_id,
          openId: this.userInfo.openId
        })
        
        uni.showToast({
          title: '注册成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }, 1500)
      } catch (error) {
        uni.showToast({
          title: error.message || '注册失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    async onChooseAvatar(e) {
      const { avatarUrl } = e.detail 
      this.userInfo.avatarUrl = avatarUrl
      
      try {
        // TODO 获取微信 openid
        // 使用 wx.login 获取登录凭证
        // const { code } = await new Promise((resolve, reject) => {
        //   wx.login({
        //     success: resolve,
        //     fail: reject
        //   })
        // })
        // // 通过登录凭证获取 openid
        // const openIdResult = await request({
        //   url: '/habit-ai/user/wx-openid',
        //   method: 'POST',
        //   data: { code }
        // })
        // this.userInfo.openId = openIdResult.openid
        
        uni.showToast({
          title: '头像设置成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('获取 openid 失败：', error)
        // 即使获取 openid 失败，也不影响头像设置
        uni.showToast({
          title: '头像设置成功',
          icon: 'success'
        })
      }
    },

    getUserProfile() {
      uni.getUserProfile({
        desc: '用于完善会员资料',
        success: (res) => {
          this.userInfo.nickName = res.userInfo.nickName
          uni.showToast({
            title: '昵称设置成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('获取用户信息失败：', err)
          uni.showToast({
            title: '获取信息失败',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style>
.container {
  padding: 40rpx;
  min-height: 100vh;
  background-color: #fff;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 60rpx;
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-arrow {
  font-size: 40rpx;
  color: #2c3e50;
}

.title {
  width: 100%;
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #2c3e50;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 60rpx;
}

.avatar-wrapper {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  width: 200rpx;  /* 减小头像容器大小 */
  height: 200rpx;
}

.avatar-wrapper:after {
  border: none;
}

.avatar {
  width: 200rpx;  /* 减小头像大小 */
  height: 200rpx;
  border-radius: 50%;  /* 保持圆形 */
}

/* 移除不需要的样式 */
.nickname-wrapper,
.nickname-label,
.nickname-input,
.tip {
  display: none;
}

.nickname-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  margin-top: 20rpx;
}

.nickname-label {
  font-size: 28rpx;
  color: #5c6b7a;
}

.nickname-input {
  width: 300rpx;
  height: 80rpx;
  background: #f5f7fa;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 32rpx;
  color: #2c3e50;
  text-align: center;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  margin-bottom: 60rpx;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.label {
  font-size: 28rpx;
  color: #5c6b7a;
}

.input-field {
  height: 100rpx;
  background: #f5f7fa;
  border-radius: 20rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  color: #2c3e50;
}

.submit-button {
  width: 100%;
  height: 100rpx;
  background: var(--theme-color);
  border-radius: 20rpx;
  color: #fff;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-button:active {
  opacity: 0.9;
}
.radio-group {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;
}

.radio-item {
  padding: 20rpx 40rpx;
  background: #f5f7fa;
  border-radius: 20rpx;
  font-size: 28rpx;
  color: #2c3e50;
}

.radio-item-active {
  background: var(--theme-color);
  color: #fff;
}
</style>