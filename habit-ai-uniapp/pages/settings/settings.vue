<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="settings-card user-info-section">
      <view class="avatar-wrapper">
        <image class="avatar" :src="userInfo.avatarUrl || '/static/default-avatar.png'" mode="aspectFill"/>
      </view>
      <view class="user-info">
        <text class="nickname">{{ userInfo.nickName || '未设置昵称' }}</text>
      </view>
    </view>

    <!-- AI设置区域 -->
    <view class="settings-card setting-item">
      <view class="setting-left">
        <text class="setting-icon">🤖</text>
        <text class="setting-label">角色设置</text>
      </view>
      <picker class="role-picker" :value="selectedRoleIndex" :range="aiRoles" @change="onRoleChange">
        <view class="picker-value">
          {{ aiRoles[selectedRoleIndex] }}
          <text class="arrow">></text>
        </view>
      </picker>
    </view>

    <!-- 隐私设置 -->
    <view class="settings-card setting-item">
      <view class="setting-left">
        <text class="setting-icon">🔒</text>
        <text class="setting-label">隐私设置</text>
      </view>
      <text class="arrow">></text>
    </view>

    <!-- 用户反馈区域 -->
    <view class="settings-card setting-item">
      <view class="setting-left">
        <text class="setting-icon">📢</text>
        <text class="setting-label">反馈与支持</text>
      </view>
      <text class="arrow" @tap="onFeedback">></text>
    </view>

    <!-- 退出登录按钮 -->
    <view class="settings-card setting-item">
      <view class="setting-left">
        <text class="setting-icon">🚪</text>
        <text class="setting-label logout">退出登录</text>
      </view>
      <text class="arrow" @tap="onLogout">></text>
    </view>
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
      aiRoles: ['助手', '教练', '朋友', '专家'],
      selectedRoleIndex: 0
    }
  },
  onLoad() {
    this.loadUserInfo()
    this.loadAISettings()
  },
  methods: {
    loadUserInfo() {
      // 从本地存储加载用户信息
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
      }
    },
    loadAISettings() {
      // 从本地存储加载AI设置
      const aiRole = uni.getStorageSync('aiRole')
      if (aiRole) {
        const index = this.aiRoles.indexOf(aiRole)
        if (index !== -1) {
          this.selectedRoleIndex = index
        }
      }
    },
    onRoleChange(e) {
      this.selectedRoleIndex = e.detail.value
      // 保存AI角色设置
      uni.setStorageSync('aiRole', this.aiRoles[this.selectedRoleIndex])
      uni.showToast({
        title: 'AI角色已更新',
        icon: 'success'
      })
    },
    onFeedback() {
      // 跳转到反馈页面或打开反馈表单
      uni.showModal({
        title: '意见反馈',
        content: '请通过以下邮箱联系我们：\nsupport@habitai.com',
        showCancel: false
      })
    },
    onLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除用户信息和相关数据
            uni.clearStorageSync()
            // 重定向到登录页面
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }
        }
      })
    }
  }
}
</script>

<style>
.container {
  padding: 30rpx;
  background: #f5f7fa;
  min-height: 100vh;
}

.settings-section {
  background: #f5f7fa;
}

.settings-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.user-info-section {
  background: var(--theme-color);
  display: flex;
  align-items: center;
  padding: 40rpx;
  height: 200rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.avatar-wrapper {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.avatar {
  width: 100%;
  height: 100%;
}

.user-info {
  margin-left: 30rpx;
  color: #fff;
}

.nickname {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100rpx;
}

.setting-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.setting-icon {
  font-size: 40rpx;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.setting-label {
  font-size: 30rpx;
  color: #2c3e50;
}

.setting-desc {
  font-size: 24rpx;
  color: #5c6b7a;
}

.arrow {
  color: #5c6b7a;
  font-size: 30rpx;
}

.picker-value {
  color: #5c6b7a;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.logout .setting-label {
  color: #ff3b30;
}
</style>
