<script>
import * as utils_storage from "./utils/storage.js";
import { apiService } from "./utils/api.js";  // Add this import

export default {
  onLaunch() {
    console.log("App Launch");
    this.autoLogin();
    // this.checkAndRestoreData();
    // utils_storage.checkAutoBackup();
  },
  onShow() {
    console.log("App Show");
  },
  onHide() {
    console.log("App Hide");
    // utils_storage.checkAutoBackup();
  },
  methods: {
    async autoLogin() {
      try {
        const telephone = uni.getStorageSync('telephone');
        const password = uni.getStorageSync('password');
        
        if (telephone && password) {
          const loginRes = await apiService.login({
            telephone,
            password
          });
          
          if (loginRes.status === 'success') {
            // Set token
            uni.setStorageSync('token', loginRes.token);
            
            // Get user info
            const userInfo = await apiService.getUserInfo();
            if (userInfo.status === 'success') {
              uni.setStorageSync('userInfo', userInfo.data);
            }
            
            // Get habit list
            const habitList = await apiService.getHabitList();
            if (habitList.status === 'success') {
              const processedHabits = habitList.data.map(habit => ({
                ...habit,
                icon: habit.icon || "✨",
                color: habit.color || '$theme-color',
                completed: Array.isArray(habit.completed) 
                  ? habit.completed.map(dateStr => {
                      const date = dateStr.includes('T') 
                        ? new Date(dateStr)
                        : new Date(dateStr.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3'));
                      return date.toISOString();
                  })
                  : []
              }));
              uni.setStorageSync('habits', processedHabits);
            }
            
            // Get AI characters
            const response = await apiService.getAICharacterList();
            if (response.status === 'success') {
              uni.setStorageSync('aiCharacters', response.data);
            }
            
            console.log('Auto login successful');
            uni.reLaunch({
              url: '/pages/index/index'
            });
          } else {
            this.clearLoginData();
          }
        }
      } catch (error) {
        console.error('Auto login failed:', error);
        this.clearLoginData();
      }
    },

    clearLoginData() {
      uni.removeStorageSync('token');
      uni.removeStorageSync('loginExpireTime');
      uni.removeStorageSync('userInfo');
      uni.removeStorageSync('habits');
      uni.removeStorageSync('aiCharacters');
    },

    async checkAndRestoreData() {
      const habits = uni.getStorageSync("habits");
      if (!habits || habits.length === 0) {
        const backupInfo = utils_storage.checkBackupAvailable();
        if (backupInfo.available) {
          uni.showModal({
            title: "发现数据备份",
            content: "检测到您有可用的数据备份，是否恢复？",
            success: (res) => {
              if (res.confirm) {
                const result = utils_storage.restoreFromBackup();
                if (result.success) {
                  uni.showToast({
                    title: "数据恢复成功",
                    icon: "success"
                  });
                } else {
                  uni.showToast({
                    title: "数据恢复失败",
                    icon: "none"
                  });
                }
              }
            }
          });
        }
      }
    }
  }
};
</script>

<style>
.container, page {
    background-color: #fff;
}

.container {
    min-height: 100vh;
}

page {
    --theme-color: #00c988;
    --theme-color-light: #fff;
    --status-bar-height: 25px;
    --top-window-height: 0px;
    --window-top: 0px;
    --window-bottom: 0px;
    --window-left: 0px;
    --window-right: 0px;
    --window-magin: 0px;
}

[data-c-h="true"] {
    display: none!important;
}
</style>