<template>
  <view class="container">
    <view class="header">
      <view class="back-button" @tap="goBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="title">注册账号</text>
    </view>

    <view class="avatar-section" @tap="getUserProfile">
      <image class="avatar" :src="userInfo.avatarUrl || '/static/default-avatar.png'" mode="aspectFill" />
      <text class="tip">点击授权获取头像和昵称</text>
    </view>

    <view class="form-section">
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
export default {
  data() {
    return {
      userInfo: {
        avatarUrl: '',
        nickName: ''
      },
      phone: '',
      password: '',
      betaCode: ''
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    getUserProfile() {
      uni.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          this.userInfo = res.userInfo
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
    handleRegister() {
      if (!this.userInfo.nickName) {
        uni.showToast({
          title: '请先授权获取用户信息',
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

      // 这里添加注册逻辑
      uni.showLoading({
        title: '注册中...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        // 模拟注册成功
        uni.setStorageSync('userInfo', {
          ...this.userInfo,
          phone: this.phone
        })
        
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }, 1500)
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
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  margin-bottom: 20rpx;
}

.tip {
  font-size: 28rpx;
  color: #5c6b7a;
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
</style>