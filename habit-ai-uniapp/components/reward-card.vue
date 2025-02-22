<template>
  <view class="reward-card-container" v-if="show" @tap="handleContainerClick" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <view class="reward-card" :class="[
      show && 'slide-in',
      isClosingUp && 'slide-out-up',
      isClosingDown && 'slide-out-down',
      isDragging && 'dragging'
    ]" :style="dragStyle" @tap.stop>
      <view class="sparkles">
        <view class="sparkle" v-for="n in 12" :key="n" :style="{'--delay': n * 0.15 + 's'}"></view>
      </view>
      <view class="stars">
        <view class="star" v-for="n in 8" :key="n" :style="{'--fall-delay': n * 0.2 + 's'}">⭐</view>
      </view>
      <view class="reward-date">{{ formattedDate }}</view>
      <view class="retroactive-badge" v-if="retroactiveInfo">
        <text class="badge-icon">🔄</text>
        <text class="badge-text">补{{ formatDate(retroactiveInfo.retroTimestamp, 'date') }}</text>
      </view>
      <view class="reward-icon pulse-animation">🎉</view>
      <view class="reward-title gradient-text">{{ title }}</view>
      <view class="reward-message">{{ message || randomMessage }}</view>

      <view class="reward-stats-container" v-if="stats || streakInfo || habitInfo">
        <!-- 删除 mode 判断，直接显示 stats -->
        <view class="reward-stats" v-if="habitInfo">
          <view class="stat-item">
            <text class="stat-value">本周第{{ stats ? stats.count : 0 }}次</text>
            <text class="stat-label">{{ habitInfo.name.slice(0, 8) }}</text>
          </view>
        </view>

        <view class="reward-streak" v-if="streakInfo">
          <view class="stat-item">
            <text class="stat-value">{{ streakInfo.count }}</text>
            <text class="stat-label">连续打卡</text>
          </view>
        </view>
      </view>

      <view class="note-input-container">
        <textarea class="note-input"
                  v-model="noteContent"
                  maxlength="200"
                  placeholder="记录一下今天的心得体会... (下滑关闭将自动保存)"
        ></textarea>
      </view>

      <view class="swipe-hint">
        <text class="hint-text">下滑关闭并保存</text>
        <text class="arrow-icon">↓</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RewardCard',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '太棒了！'
    },
    message: {
      type: String,
      default: ''
    },
    stats: {
      type: Object,
      default: null
    },
    habitInfo: {
      type: Object,
      default: null
    },
    streakInfo: {
      type: Object,
      default: null
    },
    targetTimestamp: {
      type: Number,
      default: () => new Date().getTime()
    },
    retroactiveInfo: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      isClosingUp: false,
      isClosingDown: false,
      noteContent: '',
      isDragging: false,
      startY: 0,
      currentY: 0,
      motivationalMessages: {
        daily: ['继续保持，你已经在进步了！', '每一个坚持的日子都在塑造更好的自己', /* ... */],
        streak: ['太厉害了！你的坚持让人敬佩', /* ... */],
        retroactive: ['补打卡也是一种负责任的表现', /* ... */],
        week: ['本周又完成一次，继续加油！', /* ... */]
      }
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

    randomMessage() {
      let type = 'daily'
      if (this.title.includes('补打卡')) {
        type = 'retroactive'
      } else if (this.streakInfo?.count > 0) {
        type = 'streak'
      } else {
        type = 'week'  // 默认使用 week 类型的消息
      }
      const messages = this.motivationalMessages[type]
      return messages[Math.floor(Math.random() * messages.length)]
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

  watch: {
    show(newVal) {
      if (newVal) {
        this.isClosingUp = false
        this.isClosingDown = false
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
        // 下滑关闭时保存笔记
        if (this.noteContent.trim()) {
          this.$emit('saveNote', {
            content: this.noteContent,
            timestamp: Date.now(),
            role: 'user'
          })
        }
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
        this.$emit('update:show', false)
        this.isClosingUp = false
        this.isClosingDown = false
        this.noteContent = ''
      }, 500)
    },

    handleContainerClick() {},

    formatDate(timestamp, format = 'full') {
      const date = new Date(timestamp)
      if (format === 'date') {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${year}.${month}.${day}`
      }
      if (format === 'yearMonth') {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        return `${year}年${month}月`
      }
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日`
    }
  }
}
</script>

<style>
.reward-card-container {
  background: rgba(0,0,0,.3);
  bottom: 0;
  height: 100%;
  left: 0;
  opacity: 1;
  position: fixed;
  touch-action: none;
  transition: opacity .3s ease;
  width: 100%;
  z-index: 1000;
}

.reward-card-container,.reward-card-container .reward-card {
  align-items: center;
  display: flex;
  justify-content: center;
  pointer-events: auto;
}

.reward-card-container .reward-card {
  animation: cardGlow 3s ease-in-out infinite;
  backdrop-filter: blur(20px);
  background: rgba(44,44,46,.8);
  border: 1px solid hsla(0,0%,100%,.15);
  border-radius: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,.2);
  flex-direction: column;
  max-width: 650rpx;
  opacity: 0;
  overflow: hidden;
  padding: 50rpx 40rpx;
  position: relative;
  transform: translateY(100%);
  width: 85%;
}

.reward-card-container .reward-card .sparkles {
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
}

.reward-card-container .reward-card .sparkles .sparkle {
  animation: sparkleAnimation 2s ease-in-out infinite;
  animation-delay: var(--delay);
  background: gold;
  border-radius: 50%;
  height: 10rpx;
  opacity: 0;
  position: absolute;
  width: 10rpx;
}

.reward-card-container .reward-card .sparkles .sparkle:nth-child(1) {
  left: 5%;
  top: 15%;
}

.reward-card-container .reward-card .sparkles .sparkle:nth-child(2) {
  left: 15%;
  top: 45%;
}

.reward-card-container .reward-card .sparkles .sparkle:nth-child(3) {
  left: 25%;
  top: 75%;
}

.reward-card-container .reward-card .sparkles .sparkle:nth-child(4) {
  left: 35%;
  top: 25%;
}

.reward-card-container .reward-card .sparkles .sparkle:nth-child(5) {
  left: 45%;
  top: 85%;
}

.reward-card-container .reward-card .sparkles .sparkle:nth-child(6) {
  left: 55%;
  top: 35%;
}

.reward-card-container .reward-card .sparkles .sparkle:nth-child(7) {
  left: 65%;
  top: 65%;
}

.reward-card-container .reward-card .sparkles .sparkle:nth-child(8) {
  left: 75%;
  top: 15%;
}

.reward-card-container .reward-card .sparkles .sparkle:nth-child(9) {
  left: 85%;
  top: 45%;
}

.reward-card-container .reward-card .sparkles .sparkle:nth-child(10) {
  left: 95%;
  top: 75%;
}

.reward-card-container .reward-card .sparkles .sparkle:nth-child(11) {
  left: 40%;
  top: 55%;
}

.reward-card-container .reward-card .sparkles .sparkle:nth-child(12) {
  left: 60%;
  top: 25%;
}

.reward-card-container .reward-card .stars {
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
}

.reward-card-container .reward-card .stars .star {
  animation: starFall 2s ease-out infinite;
  animation-delay: var(--fall-delay);
  font-size: 24rpx;
  opacity: 0;
  position: absolute;
  top: -20rpx;
}

.reward-card-container .reward-card .stars .star:nth-child(1) {
  animation-duration: 1.8s;
  left: 12%;
}

.reward-card-container .reward-card .stars .star:nth-child(2) {
  animation-duration: 2.2s;
  left: 28%;
}

.reward-card-container .reward-card .stars .star:nth-child(3) {
  animation-duration: 1.6s;
  left: 45%;
}

.reward-card-container .reward-card .stars .star:nth-child(4) {
  animation-duration: 2.4s;
  left: 63%;
}

.reward-card-container .reward-card .stars .star:nth-child(5) {
  animation-duration: 1.9s;
  left: 72%;
}

.reward-card-container .reward-card .stars .star:nth-child(6) {
  animation-duration: 2.1s;
  left: 88%;
}

.reward-card-container .reward-card .stars .star:nth-child(7) {
  animation-duration: 2.3s;
  left: 35%;
}

.reward-card-container .reward-card .stars .star:nth-child(8) {
  animation-duration: 1.7s;
  left: 82%;
}

.reward-card-container .reward-card .gradient-text {
  -webkit-text-fill-color: transparent;
  animation: gradientFlow 3s linear infinite;
  background: linear-gradient(90deg,#ff9f0a,gold,#ff9f0a);
  -webkit-background-clip: text;
  background-size: 200% auto;
}

.reward-card-container .reward-card .pulse-animation {
  animation: pulseBreath 2s ease-in-out infinite;
}

.reward-card-container .reward-card.slide-in {
  animation: slideIn .5s cubic-bezier(.4,0,.2,1) forwards;
}

.reward-card-container .reward-card.slide-out-up {
  animation: slideOutUp .5s cubic-bezier(.4,0,.2,1) forwards;
}

.reward-card-container .reward-card.slide-out-down {
  animation: slideOutDown .5s cubic-bezier(.4,0,.2,1) forwards;
}

.reward-card-container .reward-card .reward-date {
  background: hsla(0,0%,100%,.1);
  border-radius: 20rpx;
  color: hsla(0,0%,100%,.7);
  font-size: 24rpx;
  font-weight: 500;
  left: 24rpx;
  padding: 6rpx 16rpx;
  position: absolute;
  top: 24rpx;
}

.reward-card-container .reward-card .reward-icon {
  animation: bounce 1.2s infinite;
  filter: drop-shadow(0 4rpx 8rpx rgba(0,0,0,.2));
  font-size: 88rpx;
  margin: 40rpx 0 24rpx;
}

.reward-card-container .reward-card .reward-title {
  color: #ff9f0a;
  font-size: 40rpx;
  font-weight: 700;
  margin-bottom: 20rpx;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,.1);
}

.reward-card-container .reward-card .reward-message {
  color: hsla(0,0%,100%,.9);
  font-size: 30rpx;
  font-weight: 500;
  line-height: 1.6;
  margin-bottom: 36rpx;
  padding: 0 30rpx;
  text-align: center;
}

.reward-card-container .reward-card .reward-stats-container {
  box-sizing: border-box;
  display: flex;
  margin: 10rpx 0 36rpx;
  width: 100%;
}

.reward-card-container .reward-card .reward-stats-container .reward-stats,.reward-card-container .reward-card .reward-stats-container .reward-streak {
  backdrop-filter: blur(8px);
  background: rgba(255,159,10,.15);
  border: 1px solid rgba(255,159,10,.2);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(255,159,10,.1);
  padding: 20rpx 32rpx;
  transition: all .3s ease;
  width: 100%;
}

.reward-card-container .reward-card .reward-stats-container .reward-stats:active,.reward-card-container .reward-card .reward-stats-container .reward-streak:active {
  box-shadow: 0 2rpx 8rpx rgba(255,159,10,.05);
  transform: scale(.98);
}

.reward-card-container .reward-card .reward-stats-container .reward-stats .stat-item,.reward-card-container .reward-card .reward-stats-container .reward-streak .stat-item {
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  justify-content: space-between;
}

.reward-card-container .reward-card .reward-stats-container .reward-stats .stat-item .stat-value,.reward-card-container .reward-card .reward-stats-container .reward-streak .stat-item .stat-value {
  -webkit-text-fill-color: transparent;
  background: linear-gradient(135deg,#ff9f0a,#ffb340);
  -webkit-background-clip: text;
  color: #ff9f0a;
  flex-shrink: 0;
  font-size: 40rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,.1);
}

.reward-card-container .reward-card .reward-stats-container .reward-stats .stat-item .stat-label,.reward-card-container .reward-card .reward-stats-container .reward-streak .stat-item .stat-label {
  background: hsla(0,0%,100%,.1);
  border: 1px solid hsla(0,0%,100%,.1);
  border-radius: 20rpx;
  color: hsla(0,0%,100%,.85);
  flex-shrink: 0;
  font-size: 26rpx;
  font-weight: 500;
  letter-spacing: 0;
  max-width: 220rpx;
  overflow: hidden;
  padding: 6rpx 12rpx;
  position: relative;
  white-space: nowrap;
}

.reward-card-container .reward-card .reward-stats-container .reward-stats .stat-item .stat-label::after,.reward-card-container .reward-card .reward-stats-container .reward-streak .stat-item .stat-label::after {
  background: linear-gradient(90deg,hsla(0,0%,100%,0),rgba(44,44,46,.8));
  content: "";
  height: 100%;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  width: 40rpx;
}

.reward-card-container .reward-card .note-input-container {
  margin-top: 10rpx;
  width: 100%;
}

.reward-card-container .reward-card .note-input-container .note-input {
  background: hsla(0,0%,100%,.1);
  border: 1px solid hsla(0,0%,100%,.15);
  border-radius: 20rpx;
  box-sizing: border-box;
  color: #fff;
  font-size: 28rpx;
  height: 180rpx;
  padding: 24rpx;
  transition: all .3s ease;
  width: 100%;
}

.reward-card-container .reward-card .note-input-container .note-input:focus {
  background: hsla(0,0%,100%,.15);
  border-color: hsla(0,0%,100%,.25);
}

.reward-card-container .reward-card .swipe-hint {
  align-items: center;
  animation: floatAnimation 2s ease-in-out infinite;
  color: hsla(0,0%,100%,.6);
  display: flex;
  flex-direction: column;
  margin-top: 20rpx;
}

.reward-card-container .reward-card .swipe-hint .hint-text {
  font-size: 24rpx;
  margin-bottom: 8rpx;
}

.reward-card-container .reward-card .swipe-hint .arrow-icon {
  font-size: 32rpx;
  opacity: .8;
}

.reward-card-container .reward-card .retroactive-badge {
  align-items: center;
  backdrop-filter: blur(8px);
  background: rgba(255,159,10,.15);
  border: 1px solid rgba(255,159,10,.2);
  border-radius: 20rpx;
  display: flex;
  padding: 6rpx 16rpx;
  position: absolute;
  right: 24rpx;
  top: 24rpx;
}

.reward-card-container .reward-card .retroactive-badge .badge-icon {
  font-size: 24rpx;
  margin-right: 6rpx;
}

.reward-card-container .reward-card .retroactive-badge .badge-text {
  color: #ff9f0a;
  font-size: 22rpx;
  font-weight: 500;
}

@-webkit-keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(100%);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
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

@-webkit-keyframes slideOutUp {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(-100%);
  }
}

@keyframes slideOutUp {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(-100%);
  }
}

@-webkit-keyframes slideOutDown {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(100%);
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

@-webkit-keyframes bounce {
  0%,100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-16rpx);
  }
}

@keyframes bounce {
  0%,100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-16rpx);
  }
}

@-webkit-keyframes sparkleAnimation {
  0% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }

  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }

  100% {
    opacity: 0;
    transform: scale(0) rotate(1turn);
  }
}

@keyframes sparkleAnimation {
  0% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }

  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }

  100% {
    opacity: 0;
    transform: scale(0) rotate(1turn);
  }
}

@-webkit-keyframes starFall {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) rotate(0deg);
  }

  20% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateY(300rpx) translateX(20rpx) rotate(1turn);
  }
}

@keyframes starFall {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) rotate(0deg);
  }

  20% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateY(300rpx) translateX(20rpx) rotate(1turn);
  }
}

@-webkit-keyframes gradientFlow {
  0% {
    background-position: 0;
  }

  100% {
    background-position: 200%;
  }
}

@keyframes gradientFlow {
  0% {
    background-position: 0;
  }

  100% {
    background-position: 200%;
  }
}

@-webkit-keyframes pulseBreath {
  0%,100% {
    filter: brightness(1);
    transform: scale(1);
  }

  50% {
    filter: brightness(1.2);
    transform: scale(1.1);
  }
}

@keyframes pulseBreath {
  0%,100% {
    filter: brightness(1);
    transform: scale(1);
  }

  50% {
    filter: brightness(1.2);
    transform: scale(1.1);
  }
}

@-webkit-keyframes cardGlow {
  0%,100% {
    box-shadow: 0 8rpx 32rpx rgba(0,0,0,.2);
  }

  50% {
    box-shadow: 0 8rpx 32rpx rgba(255,159,10,.3);
  }
}

@keyframes cardGlow {
  0%,100% {
    box-shadow: 0 8rpx 32rpx rgba(0,0,0,.2);
  }

  50% {
    box-shadow: 0 8rpx 32rpx rgba(255,159,10,.3);
  }
}

@-webkit-keyframes floatAnimation {
  0%,100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10rpx);
  }
}

@keyframes floatAnimation {
  0%,100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10rpx);
  }
}
</style>