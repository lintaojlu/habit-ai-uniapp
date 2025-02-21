<template>
  <view class="conv-card-container" v-if="show" @tap="handleContainerClick" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <view class="conv-card" :class="[
      show && 'slide-in',
      isClosingDown && 'slide-out-down',
      isDragging && 'dragging'
    ]" :style="dragStyle" @tap.stop>
      <!-- 日期显示 -->
      <view class="conv-date">{{ formattedDate }}</view>

      <!-- 对话内容区域 -->
      <view class="conv-content">
        <view class="chat-message">
          <view class="avatar">{{ emoji }}</view>
          <view class="chat-bubble">
            <text class="message-text">{{ content }}</text>
          </view>
        </view>
      </view>

      <!-- 底部提示 -->
      <view class="swipe-hint">
        <text class="hint-text">下滑关闭</text>
        <text class="arrow-icon">↓</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ConvCard',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    emoji: {
      type: String,
      default: '🤖'
    },
    content: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      isClosingDown: false,
      isDragging: false,
      startY: 0,
      currentY: 0
    }
  },

  computed: {
    formattedDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const date = now.getDate()
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekDay = weekDays[now.getDay()]
      return `${year}年${month}月${date}日 ${weekDay}`
    },

    dragStyle() {
      if (!this.isDragging) return {}
      const translateY = Math.max(0, this.currentY - this.startY)
      return {
        transform: `translateY(${translateY}px)`,
        transition: 'none'
      }
    }
  },

  methods: {
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
        this.closeCard()
      }
      this.isDragging = false
      this.startY = 0
      this.currentY = 0
      e.stopPropagation()
    },

    closeCard() {
      this.isClosingDown = true
      setTimeout(() => {
        this.$emit('updateShow', false)
        this.isClosingDown = false
      }, 500)
    }
  }
}
</script>

<style>
.conv-card-container {
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
  touch-action: none;
}

.conv-card {
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

.conv-date {
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

.conv-content {
  margin: 60rpx 0 30rpx;
  width: 100%;
}

.chat-message {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 0 10rpx;
}

.avatar {
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  background: rgba(255,159,10,.15);
  border: 1px solid rgba(255,159,10,.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(255,159,10,.1);
}

.chat-bubble {
  position: relative;
  flex: 1;
  background: rgba(255,159,10,.15);
  border: 1px solid rgba(255,159,10,.2);
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(255,159,10,.1);
}

.chat-bubble::before {
  content: '';
  position: absolute;
  left: -16rpx;
  top: 24rpx;
  border: 8rpx solid transparent;
  border-right-color: rgba(255,159,10,.15);
}

.bubble-title {
  color: #ff9f0a;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.bubble-list {
  color: hsla(0,0%,100%,.9);
}

.bubble-item {
  font-size: 28rpx;
  line-height: 1.6;
  margin-bottom: 16rpx;
  padding-left: 16rpx;
}

.bubble-item:last-child {
  margin-bottom: 0;
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

.conv-card.slide-in {
  animation: slideIn .5s cubic-bezier(.4,0,.2,1) forwards;
}

.conv-card.slide-out-down {
  animation: slideOutDown .5s cubic-bezier(.4,0,.2,1) forwards;
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

@keyframes floatAnimation {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
}

.message-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: hsla(0,0%,100%,.9);
  white-space: pre-wrap;
  word-break: break-word;
}

/* 移除不需要的样式 */
.bubble-list,
.bubble-item {
  display: none;
}
</style>