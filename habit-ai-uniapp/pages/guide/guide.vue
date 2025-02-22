<template>
  <view class="container">
    <view class="guide-content">
      <image class="qr-code" src="/static/group_qr.png" mode="aspectFit"></image>
      <text class="guide-title">一步之遥🎉</text>
      <text class="guide-desc">扫描上方二维码，添加AI为好友\n它将帮助你更好地完成目标</text>
    </view>
    <button class="complete-btn" @tap="handleComplete">完成添加</button>
  </view>
</template>

<script>
export default {
  methods: {
    handleComplete() {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 100vh;
  padding: 40rpx;
  box-sizing: border-box;
  background-color: #fff;
}

.guide-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100rpx;
}

.qr-code {
  width: 400rpx;
  height: 400rpx;
  margin-bottom: 40rpx;
}

.guide-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20rpx;
}

.guide-desc {
  font-size: 28rpx;
  color: #5c6b7a;
  text-align: center;
  line-height: 1.6;
}

.complete-btn {
  width: 100%;
  height: 100rpx;
  background: var(--theme-color);
  color: #fff;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 159, 10, .15);
}

.complete-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}
</style>