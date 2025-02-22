"use strict";
const common_vendor = require("../common/vendor.js");
const BACKUP_KEY = "habits_backup";
function restoreFromBackup(options = { mode: "full" }) {
  try {
    const backup = common_vendor.index.getStorageSync(BACKUP_KEY);
    if (backup && backup.data) {
      return restoreData(backup.data, options);
    }
    return restoreFromFile(options);
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:97", "恢复数据失败:", error);
    return {
      success: false,
      message: "恢复数据失败",
      error
    };
  }
}
function restoreFromFile(options = { mode: "full" }) {
  const fs = common_vendor.index.getFileSystemManager();
  const backupPath = `${common_vendor.index.env.USER_DATA_PATH}/backups`;
  try {
    const files = fs.readdirSync(backupPath);
    const backupFiles = files.filter((f) => f.startsWith("habits_backup_")).sort().reverse();
    if (backupFiles.length === 0) {
      return {
        success: false,
        message: "未找到可用的备份文件"
      };
    }
    const latestBackup = fs.readFileSync(`${backupPath}/${backupFiles[0]}`, "utf8");
    const backupDataObj = JSON.parse(latestBackup);
    return restoreData(backupDataObj.data, options);
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:125", "从备份文件恢复失败:", error);
    return {
      success: false,
      message: "从备份文件恢复失败",
      error
    };
  }
}
function restoreData(backupData, options = { mode: "full" }) {
  try {
    const currentHabits = common_vendor.index.getStorageSync("habits") || [];
    let restoredHabits = [];
    switch (options.mode) {
      case "full":
        restoredHabits = backupData;
        break;
      case "merge":
        restoredHabits = mergeHabits(currentHabits, backupData);
        break;
      default:
        throw new Error("不支持的恢复模式");
    }
    common_vendor.index.setStorageSync("habits", restoredHabits);
    return {
      success: true,
      message: "数据恢复成功",
      restoredCount: restoredHabits.length,
      timestamp: Date.now()
    };
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:161", "恢复数据失败:", error);
    return {
      success: false,
      message: error.message || "恢复数据失败",
      error
    };
  }
}
function mergeHabits(currentHabits, backupHabits) {
  const mergedHabits = [...currentHabits];
  backupHabits.forEach((backupHabit) => {
    const existingIndex = mergedHabits.findIndex((h) => h.id === backupHabit.id);
    if (existingIndex === -1) {
      mergedHabits.push(backupHabit);
    } else {
      const currentHabit = mergedHabits[existingIndex];
      if (backupHabit.updateTime > currentHabit.updateTime) {
        const mergedCompleted = [.../* @__PURE__ */ new Set([...currentHabit.completed, ...backupHabit.completed])];
        const mergedNotes = mergeNotes(currentHabit.notes || [], backupHabit.notes || []);
        mergedHabits[existingIndex] = {
          ...backupHabit,
          completed: mergedCompleted,
          notes: mergedNotes
        };
      }
    }
  });
  return mergedHabits;
}
function mergeNotes(currentNotes, backupNotes) {
  const notesMap = /* @__PURE__ */ new Map();
  [...currentNotes, ...backupNotes].forEach((note) => {
    const key = `${note.timestamp}_${note.content}`;
    const existingNote = notesMap.get(key);
    if (!existingNote || note.saveTimestamp > existingNote.saveTimestamp) {
      notesMap.set(key, note);
    }
  });
  return Array.from(notesMap.values()).sort((a, b) => b.timestamp - a.timestamp);
}
function checkBackupAvailable() {
  try {
    const backup = common_vendor.index.getStorageSync(BACKUP_KEY);
    if (backup && backup.data) {
      return {
        available: true,
        timestamp: backup.timestamp,
        source: "storage"
      };
    }
    const fs = common_vendor.index.getFileSystemManager();
    const backupPath = `${common_vendor.index.env.USER_DATA_PATH}/backups`;
    try {
      const files = fs.readdirSync(backupPath);
      const backupFiles = files.filter((f) => f.startsWith("habits_backup_"));
      if (backupFiles.length > 0) {
        const latestBackup = JSON.parse(
          fs.readFileSync(`${backupPath}/${backupFiles[backupFiles.length - 1]}`, "utf8")
        );
        return {
          available: true,
          timestamp: latestBackup.timestamp,
          source: "file"
        };
      }
    } catch (e) {
    }
    return {
      available: false
    };
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:245", "检查备份失败:", error);
    return {
      available: false,
      error
    };
  }
}
exports.checkBackupAvailable = checkBackupAvailable;
exports.restoreFromBackup = restoreFromBackup;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/storage.js.map
