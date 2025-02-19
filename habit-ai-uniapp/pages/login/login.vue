<template>
  <view class="container">
    <view class="logo-section">
      <image class="poster" src="/static/poster.png" mode="aspectFit" />
      <text class="app-name">HabitAI</text>
      <text class="slogan">私人 AI，轻松养成好习惯</text>
    </view>

    <view class="form-section">
      <input 
        class="input-field" 
        type="text" 
        v-model="telephone" 
        placeholder="手机号"
      />
      <input 
        class="input-field" 
        type="password" 
        v-model="password" 
        placeholder="密码"
      />
      <button class="submit-button" @tap="handleSubmit">登录</button>
      <text class="switch-mode" @tap="goToRegister">
        没有账号？立即注册
      </text>
    </view>
  </view>
</template>

<script>
import { request } from '@/utils/api.js'

export default {
  data() {
    return {
      telephone: '',  // 改为 telephone
      password: ''
    }
  },
  methods: {
    goToRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      })
    },
    async handleSubmit() {
      if (!this.telephone || !this.password) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      uni.showLoading({
        title: '登录中...'
      })
      
      try {
        const res = await request({
          url: '/habit-ai/user/login',
          method: 'POST',
          data: {
            telephone: this.telephone,
            password: this.password
          }
        })
        
        // 保存 token 和用户信息
        uni.setStorageSync('token', res.token)
        uni.setStorageSync('userId', res.user_id)
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 跳转到首页
        uni.reLaunch({
          url: '/pages/index/index'
        })
      } catch (error) {
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style>
.container {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #fff;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.poster {
  width: 400rpx;
  height: 400rpx;
  margin-bottom: 30rpx;
  border-radius: 50%;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 20rpx;
}

.slogan {
  font-size: 32rpx;
  color: #5c6b7a;
}

.form-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.input-field {
  width: 100%;
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
  margin-top: 20rpx;
}

.submit-button:active {
  opacity: 0.9;
}

.switch-mode {
  text-align: center;
  color: var(--theme-color);
  font-size: 28rpx;
  margin-top: 30rpx;
}
</style>