<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="user-info-section">
      <view class="avatar-wrapper">
        <image class="avatar" :src="userInfo.avatarUrl || '/static/default-avatar.png'" mode="aspectFill" />
      </view>
      <text class="nickname">{{ userInfo.nickName || '未设置昵称' }}</text>
    </view>

    <!-- AI设置区域 -->
    <view class="settings-section">
      <view class="section-title">AI 设置</view>
      <view class="setting-item">
        <text class="setting-label">AI 角色</text>
        <picker class="role-picker" :value="selectedRoleIndex" :range="aiRoles" @change="onRoleChange">
          <view class="picker-value">{{ aiRoles[selectedRoleIndex] }}</view>
        </picker>
      </view>
    </view>

    <!-- 用户反馈区域 -->
    <view class="settings-section">
      <view class="section-title">反馈与支持</view>
      <view class="setting-item feedback-button" @tap="onFeedback">
        <text class="setting-label">意见反馈</text>
        <text class="arrow">></text>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <button class="logout-button" @tap="onLogout">退出登录</button>
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
  padding: 40rpx;
}

.user-info-section {
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: 60rpx;
  padding: 40rpx 0;
}

.avatar-wrapper {
  border-radius: 50%;
  height: 160rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  width: 160rpx;
}

.avatar {
  height: 100%;
  width: 100%;
}

.nickname {
  color: #2c3e50;
  font-size: 32rpx;
  font-weight: 600;
}

.settings-section {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 40rpx;
  padding: 30rpx;
}

.section-title {
  color: #5c6b7a;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.setting-item {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
}

.setting-label {
  color: #2c3e50;
  font-size: 30rpx;
}

.role-picker {
  flex: 1;
  margin-left: 20rpx;
}

.picker-value {
  color: #2c3e50;
  font-size: 30rpx;
  text-align: right;
}

.feedback-button {
  cursor: pointer;
}

.arrow {
  color: #5c6b7a;
  font-size: 30rpx;
}

.logout-section {
  margin-top: 80rpx;
  padding: 0 40rpx;
}

.logout-button {
  background: var(--theme-color);  /* 修改为使用主题色变量 */
  border-radius: 20rpx;
  color: #fff;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
}

.logout-button:active {
  opacity: 0.9;
}
</style>