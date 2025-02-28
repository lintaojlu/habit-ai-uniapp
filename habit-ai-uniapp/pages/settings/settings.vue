<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="settings-card user-info-section">
      <view class="avatar-wrapper">
        <image class="avatar" :src="userInfo.avatar_url || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'" mode="aspectFill"/>
      </view>
      <view class="user-info">
        <text class="nickname">{{ userInfo.nickname }}</text>
      </view>
    </view>

    <!-- AI设置区域 -->
    <picker 
      ref="rolePicker"
      class="role-picker" 
      :value="selectedRoleIndex" 
      :range="ai_character_names" 
      @change="onRoleChange"
    >
      <view class="settings-card setting-item">
        <view class="setting-left">
          <text class="setting-icon">🤖</text>
          <text class="setting-label">角色设置</text>
        </view>
        <view class="picker-value">
          {{ currentCharacterName }}
          <text class="arrow">></text>
        </view>
      </view>
    </picker>

    <!-- 添加微信选项 -->
    <view class="settings-card setting-item" @tap="onWechat">
      <view class="setting-left">
        <text class="setting-icon">😈</text>
        <text class="setting-label">添加微信</text>
      </view>
      <text class="arrow">></text>
    </view>

    <!-- 用户反馈区域 -->
    <view class="settings-card setting-item" @tap="onFeedback">
      <view class="setting-left">
        <text class="setting-icon">📢</text>
        <text class="setting-label">意见反馈</text>
      </view>
      <text class="arrow">></text>
    </view>

    <!-- 隐私设置 -->
    <view class="settings-card setting-item" @tap="onPrivacy">
      <view class="setting-left">
        <text class="setting-icon">🔒</text>
        <text class="setting-label">隐私设置</text>
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

    <!-- 添加二维码卡片组件 -->
    <view class="qr-card-container" v-if="showQrCard" @tap="closeQrCard">
      <view class="qr-card" 
        :class="[
          showQrCard && 'slide-in',
          isClosingDown && 'slide-out-down',
          isDragging && 'dragging'
        ]" 
        :style="dragStyle"
        @tap.stop
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <view class="qr-date">{{ formattedDate }}</view>
        <view class="qr-content">
          <text class="qr-title">加入内测群</text>
          <image class="qr-image" src="/static/group_qr.png" mode="aspectFit"></image>
          <text class="qr-desc">扫描二维码加入内测群\n一起交流使用心得</text>
        </view>
        <view class="swipe-hint">
          <text class="hint-text">下滑关闭</text>
          <text class="arrow-icon">↓</text>
        </view>
      </view>
    </view>

    <!-- 添加微信二维码卡片组件 -->
    <view class="qr-card-container" v-if="showWechatCard" @tap="closeWechatCard">
      <view class="qr-card" 
        :class="[
          showWechatCard && 'slide-in',
          isWechatClosingDown && 'slide-out-down',
          isWechatDragging && 'dragging'
        ]" 
        :style="wechatDragStyle"
        @tap.stop
        @touchstart="handleWechatTouchStart"
        @touchmove="handleWechatTouchMove"
        @touchend="handleWechatTouchEnd"
      >
        <view class="qr-date">{{ formattedDate }}</view>
        <view class="qr-content">
          <text class="qr-title">添加Aibby微信</text>
          <image class="qr-image" src="/static/wechat_qr.png" mode="aspectFit"></image>
          <text class="qr-desc">扫描二维码添加我的微信😈</text>
        </view>
        <view class="swipe-hint">
          <text class="hint-text">下滑关闭</text>
          <text class="arrow-icon">↓</text>
        </view>
      </view>
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
      selectedRoleIndex: 0,  // 添加逗号
      showQrCard: false,      // 添加 showQrCard
      isClosingDown: false,
      isDragging: false,
      startY: 0,
      currentY: 0,
      showWechatCard: false,
      isWechatClosingDown: false,
      isWechatDragging: false,
      wechatStartY: 0,
      wechatCurrentY: 0
    }
  },

  computed: {
    ai_character_names() {
      return this.aiCharacters.map(char => char.name)
    },
    currentCharacterName() {
      if (this.aiCharacters.length === 0) return '加载中...'
      return this.aiCharacters[this.selectedRoleIndex]?.name || '请选择角色'
    },
    // 添加 formattedDate 计算属性
    formattedDate() {
      const now = new Date()
      const month = now.getMonth() + 1
      const date = now.getDate()
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekDay = weekDays[now.getDay()]
      return `${month}月${date}日 ${weekDay}`
    }
  },

  onLoad() {
    this.loadUserInfo()
    console.log('[setting] userInfo:', this.userInfo)
    this.loadAICharacters()
  },

  methods: {
    onWechat() {
      this.showWechatCard = true
    },

    handleWechatTouchStart(e) {
      this.wechatStartY = e.touches[0].clientY
      this.isWechatDragging = true
      e.stopPropagation()
    },

    handleWechatTouchMove(e) {
      if (!this.isWechatDragging) return
      this.wechatCurrentY = e.touches[0].clientY
      e.preventDefault()
      e.stopPropagation()
    },

    handleWechatTouchEnd(e) {
      if (!this.isWechatDragging) return
      const dragDistance = this.wechatCurrentY - this.wechatStartY
      if (dragDistance > 100) {
        this.closeWechatCard()
      }
      this.isWechatDragging = false
      this.wechatStartY = 0
      this.wechatCurrentY = 0
      e.stopPropagation()
    },

    closeWechatCard() {
      this.isWechatClosingDown = true
      setTimeout(() => {
        this.showWechatCard = false
        this.isWechatClosingDown = false
      }, 500)
    },
    showRolePicker() {
      // 手动触发 picker 的点击事件
      const picker = this.$refs.rolePicker
      if (picker) {
        picker.$el.click()
      }
    },
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
        title: '您的所有数据仅用于核心功能，不收集、不存储、不共享任何个人信息。',
        icon: 'none'
      })
    },

    onFeedback() {
      this.showQrCard = true
    },

    onLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除本地存储的用户信息
            uni.removeStorageSync('userInfo')
            uni.removeStorageSync('token')
            uni.removeStorageSync('habits')
            uni.removeStorageSync('aiCharacters')
            uni.clearStorageSync()

            // 重定向到登录页
            uni.reLaunch({
              url: '/pages/login/login'
            })
          }
        }
      })
    },

    handleTouchStart(e) {
      this.startY = e.touches[0].clientY
      this.isDragging = true
      e.stopPropagation()
    },

    handleTouchMove(e) {
      if (!this.isDragging) return
      this.currentY = e.touches[0].clientY
      e.preventDefault()
      e.stopPropagation()
    },

    handleTouchEnd(e) {
      if (!this.isDragging) return
      const dragDistance = this.currentY - this.startY
      if (dragDistance > 100) {
        this.closeQrCard()
      }
      this.isDragging = false
      this.startY = 0
      this.currentY = 0
      e.stopPropagation()
    },

    closeQrCard() {
      this.isClosingDown = true
      setTimeout(() => {
        this.showQrCard = false
        this.isClosingDown = false
      }, 500)
    },
    async onRoleChange(e) {
      const index = e.detail.value
      const newCharacter = this.aiCharacters[index]
      
      try {
        // 调用接口更新角色
        const response = await apiService.updateUserInfo({
          ai_character_name: newCharacter.name
        })

        if (response.status === 'success') {
          // 更新本地存储的用户信息
          const userInfo = uni.getStorageSync('userInfo')
          userInfo.ai_character_name = newCharacter.name
          uni.setStorageSync('userInfo', userInfo)
          
          // 更新当前组件的数据
          this.userInfo.ai_character_name = newCharacter.name
          this.selectedRoleIndex = index

          uni.showToast({
            title: '角色更新成功',
            icon: 'success'
          })
        } else {
          throw new Error(response.message || '更新失败')
        }
      } catch (error) {
        console.error('更新角色失败:', error)
        uni.showToast({
          title: error.message || '更新失败',
          icon: 'none'
        })
        
        // 恢复之前的选择
        const prevIndex = this.aiCharacters.findIndex(
          char => char.name === this.userInfo.ai_character_name
        )
        if (prevIndex !== -1) {
          this.selectedRoleIndex = prevIndex
        }
      }
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
  background: #fff;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.setting-item:active {
  background: #f5f7fa;
  transform: scale(0.98);
}

.setting-item::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 20rpx;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: all 0.3s ease;
}

.setting-item:active::after {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

.setting-item:active .logout {
  opacity: 0.8;
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

.qr-card-container {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,.3);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity .3s ease;
}

.qr-card {
  width: 85%;
  max-width: 650rpx;
  background: rgba(44,44,46,.8);
  backdrop-filter: blur(20px);
  border-radius: 32rpx;
  border: 1px solid hsla(0,0%,100%,.15);
  padding: 40rpx 30rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(100%);
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,.2);
}

.qr-date {
  background: hsla(0,0%,100%,.1);
  border-radius: 20rpx;
  color: hsla(0,0%,100%,.7);
  font-size: 24rpx;
  font-weight: 500;
  padding: 6rpx 16rpx;
  position: absolute;
  left: 24rpx;
  top: 24rpx;
}

.qr-content {
  margin: 60rpx 0 30rpx;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30rpx;
}

.qr-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ff9f0a;
}

.qr-image {
  width: 400rpx;
  height: 400rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
}

.qr-desc {
  font-size: 28rpx;
  color: hsla(0,0%,100%,.9);
  text-align: center;
  line-height: 1.6;
}

.swipe-hint {
  align-items: center;
  animation: floatAnimation 2s ease-in-out infinite;
  color: hsla(0,0%,100%,.6);
  display: flex;
  flex-direction: column;
  margin-top: 20rpx;
}

.swipe-hint .hint-text {
  font-size: 24rpx;
  margin-bottom: 8rpx;
}

.swipe-hint .arrow-icon {
  font-size: 32rpx;
  opacity: .8;
}

.qr-card.slide-in {
  animation: slideIn .5s cubic-bezier(.4,0,.2,1) forwards;
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes floatAnimation {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
}

/* 添加下滑相关样式 */
.qr-card.slide-out-down {
  animation: slideOutDown .5s cubic-bezier(.4,0,.2,1) forwards;
}

.qr-card.dragging {
  transition: none;
}

@keyframes slideOutDown {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(100%);
  }
}
</style>
