<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="settings-card user-info-section">
      <view class="avatar-wrapper">
        <image class="avatar" :src="userInfo.avatar_url || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'" mode="aspectFill"/>
      </view>
      <view class="user-info">
        <text class="nickname">{{ userInfo.nickname || '未设置昵称' }}</text>
      </view>
    </view>

    <!-- AI设置区域 -->
    <view class="settings-card setting-item">
      <view class="setting-left">
        <text class="setting-icon">🤖</text>
        <text class="setting-label">角色设置</text>
      </view>
      <picker 
        ref="rolePicker"
        class="role-picker" 
        :value="selectedRoleIndex" 
        :range="aiCharacterNames" 
        @change="onRoleChange"
      >
        <view class="picker-value">
          {{ currentCharacterName }}
          <text class="arrow">></text>
        </view>
      </picker>
    </view>

    <!-- 隐私设置 -->
    <view class="settings-card setting-item" @tap="onPrivacy">
      <view class="setting-left">
        <text class="setting-icon">🔒</text>
        <text class="setting-label">隐私设置</text>
      </view>
      <text class="arrow">></text>
    </view>

    <!-- 用户反馈区域 -->
    <view class="settings-card setting-item" @tap="onFeedback">
      <view class="setting-left">
        <text class="setting-icon">📢</text>
        <text class="setting-label">反馈与支持</text>
      </view>
      <text class="arrow">></text>
    </view>

    <!-- 退出登录按钮 -->
    <view class="settings-card setting-item" @tap="onLogout">
      <view class="setting-left">
        <text class="setting-icon">🚪</text>
        <text class="setting-label logout">退出登录</text>
      </view>
      <text class="arrow">></text>
    </view>
  </view>
</template>

<script>
import { apiService } from '@/utils/api.js'  // 添加导入

export default {
  data() {
    return {
      userInfo: {
        user_id: '',
        nickname: '',
        avatar_url: '',
        ai_character_name: '',
        telephone: '',
      },
      aiCharacters: [], // AI角色列表
      selectedRoleIndex: 0
    }
  },

  computed: {
    aiCharacterNames() {
      return this.aiCharacters.map(char => char.name)
    },
    currentCharacterName() {
      if (this.aiCharacters.length === 0) return '加载中...'
      return this.aiCharacters[this.selectedRoleIndex]?.name || '请选择角色'
    }
  },

  onLoad() {
    this.loadUserInfo()
    this.loadAICharacters()
  },

  methods: {
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
      }
    },

    async loadAICharacters() {
      try {
        // 先从本地获取角色列表
        const characters = uni.getStorageSync('aiCharacters')
        if (characters) {
          this.aiCharacters = characters
          
          // 如果用户有设置角色，找到对应的索引
          if (this.userInfo.ai_character_name) {
            const currentIndex = this.aiCharacters.findIndex(
              char => char.name === this.userInfo.ai_character_name
            )
            if (currentIndex !== -1) {
              this.selectedRoleIndex = currentIndex
            }
          }
        } else {
          // 如果本地没有角色列表，从服务器获取
          const response = await apiService.getAICharacterList()
          if (response.status === 'success') {
            this.aiCharacters = response.data
            uni.setStorageSync('aiCharacters', response.data)
            
            // 设置当前选中的角色索引
            if (this.userInfo.ai_character_name) {
              const currentIndex = this.aiCharacters.findIndex(
                char => char.name === this.userInfo.ai_character_name
              )
              if (currentIndex !== -1) {
                this.selectedRoleIndex = currentIndex
              }
            }
          }
        }
      } catch (error) {
        console.error('加载AI角色失败:', error)
        uni.showToast({
          title: '加载角色失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },

    onPrivacy() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },

    onFeedback() {
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
            uni.clearStorageSync()
            uni.reLaunch({
              url: '/pages/login/login'
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
  cursor: pointer; /* 添加手型光标 */
}

.setting-item:active {
  opacity: 0.8; /* 添加点击反馈效果 */
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
