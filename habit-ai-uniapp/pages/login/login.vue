<template>
  <view class="container">
    <view class="logo-section">
      <text class="emoji-logo">😈</text>
      <text class="app-name">HabitAI</text>
      <text class="slogan">AI陪你努力生活！</text>
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
        还没有账号？立即注册
      </text>
    </view>
  </view>
</template>

<script>
import { apiService } from '@/utils/api.js'

export default {
  data() {
    return {
      telephone: '',
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
        const res = await apiService.login({
          telephone: this.telephone,
          password: this.password
        })
        
        if (res.status === 'success') {
          // 清空本地存储
          uni.clearStorageSync();

          // 保存 token 和用户信息
          uni.setStorageSync('token', res.token)
          
          // 获取用户详细信息
          const userInfo = await apiService.getUserInfo()
          if (userInfo.status === 'success') {
            uni.setStorageSync('userInfo', userInfo.data)
            console.log("get userInfo from server", userInfo.data)
          }

          // 获取习惯列表
          const habitList = await apiService.getHabitList()
          if (habitList.status === 'success') {
              // 处理 habitList.data，确保每个习惯都有 icon、color，并统一日期格式
              const processedHabits = habitList.data.map(habit => ({
                  ...habit,
                  icon: habit.icon || "✨",
                  color: habit.color || '$theme-color',
                  completed: Array.isArray(habit.completed) 
                      ? habit.completed.map(dateStr => {
                          // 统一转换为 ISO 格式
                          const date = dateStr.includes('T') 
                            ? new Date(dateStr)
                            : new Date(dateStr.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3'))
                          return date.toISOString()
                      })
                      : []
              }))
              
              // 更新本地存储和数据
              this.habits = processedHabits
              uni.setStorageSync('habits', processedHabits)
              console.log("get habits from server", processedHabits)
          }

          // 获取AI角色列表
          const response = await apiService.getAICharacterList()
          if (response.status === 'success') {
            uni.setStorageSync('aiCharacters', response.data)
            console.log("get aiCharacters from server", response.data)
          }
              
          
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          // 跳转到首页
          uni.reLaunch({
            url: '/pages/index/index'
          })
        } else {
          throw new Error(res.message || '登录失败')
        }
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

.emoji-logo {
  font-size: 200rpx;
  margin-bottom: 30rpx;
  line-height: 1;
}

/* 删除原有的 .poster 样式 */

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