<script>
import * as utils_storage from "./utils/storage.js";

export default {
  onLaunch() {
    console.log("App Launch");
    this.checkAndRestoreData();
    utils_storage.checkAutoBackup();
  },
  onShow() {
    console.log("App Show");
  },
  onHide() {
    console.log("App Hide");
    utils_storage.checkAutoBackup();
  },
  methods: {
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