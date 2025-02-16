// src/utils/storage.js

const BACKUP_KEY = "habits_backup";
const LAST_BACKUP_TIME_KEY = "last_backup_time";
const AUTO_BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 小时

/**
 * 自动备份检查，如果上次备份时间超过24小时，则执行备份
 */
export function checkAutoBackup() {
    const lastBackupTime = uni.getStorageSync(LAST_BACKUP_TIME_KEY) || 0;
    const now = Date.now();
    if (now - lastBackupTime >= AUTO_BACKUP_INTERVAL) {
        return backupData();
    }
    return false;
}

/**
 * 执行数据备份，将 habits 数据保存到 storage 及文件中
 */
export function backupData() {
    try {
        const habits = uni.getStorageSync("habits") || [];
        if (habits.length === 0) return false;
        const backup = {
            timestamp: Date.now(),
            data: habits,
            version: "1.0"
        };
        uni.setStorageSync(BACKUP_KEY, backup);
        saveBackupToFile(backup);
        uni.setStorageSync(LAST_BACKUP_TIME_KEY, backup.timestamp);
        return true;
    } catch (error) {
        console.error("备份数据失败:", error);
        return false;
    }
}

/**
 * 将备份数据保存到文件中（仅限支持文件系统的平台，如微信小程序）
 */
function saveBackupToFile(backup) {
    const fs = uni.getFileSystemManager();
    const fileName = `habits_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    const userPath = `${uni.env.USER_DATA_PATH}/backups`;
    try {
        // 检查文件夹是否存在，不存在则创建
        try {
            fs.accessSync(userPath);
        } catch (e) {
            fs.mkdirSync(userPath, true);
        }
        fs.writeFileSync(`${userPath}/${fileName}`, JSON.stringify(backup), "utf8");
        cleanupOldBackups(fs, userPath);
    } catch (error) {
        console.error("保存备份文件失败:", error);
    }
}

/**
 * 清理旧的备份文件，只保留最新的5个备份文件
 */
function cleanupOldBackups(fs, backupPath) {
    try {
        const files = fs.readdirSync(backupPath);
        const backupFiles = files.filter(f => f.startsWith("habits_backup_"));
        if (backupFiles.length > 5) {
            backupFiles
                .sort()
                .slice(0, backupFiles.length - 5)
                .forEach(file => {
                    try {
                        fs.unlinkSync(`${backupPath}/${file}`);
                    } catch (e) {
                        console.error("删除旧备份文件失败:", e);
                    }
                });
        }
    } catch (error) {
        console.error("清理旧备份失败:", error);
    }
}

/**
 * 从备份中恢复数据（默认模式为 full 恢复）
 */
export function restoreFromBackup(options = { mode: "full" }) {
    try {
        const backup = uni.getStorageSync(BACKUP_KEY);
        if (backup && backup.data) {
            return restoreData(backup.data, options);
        }
        return restoreFromFile(options);
    } catch (error) {
        console.error("恢复数据失败:", error);
        return {
            success: false,
            message: "恢复数据失败",
            error
        };
    }
}

/**
 * 从备份文件中恢复数据
 */
function restoreFromFile(options = { mode: "full" }) {
    const fs = uni.getFileSystemManager();
    const backupPath = `${uni.env.USER_DATA_PATH}/backups`;
    try {
        const files = fs.readdirSync(backupPath);
        const backupFiles = files.filter(f => f.startsWith("habits_backup_")).sort().reverse();
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
        console.error("从备份文件恢复失败:", error);
        return {
            success: false,
            message: "从备份文件恢复失败",
            error
        };
    }
}

/**
 * 根据不同模式恢复数据
 * - full 模式：完全使用备份数据覆盖当前数据
 * - merge 模式：将备份数据与当前数据合并
 */
function restoreData(backupData, options = { mode: "full" }) {
    try {
        const currentHabits = uni.getStorageSync("habits") || [];
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
        uni.setStorageSync("habits", restoredHabits);
        return {
            success: true,
            message: "数据恢复成功",
            restoredCount: restoredHabits.length,
            timestamp: Date.now()
        };
    } catch (error) {
        console.error("恢复数据失败:", error);
        return {
            success: false,
            message: error.message || "恢复数据失败",
            error
        };
    }
}

/**
 * 将当前习惯数据与备份数据进行合并
 */
function mergeHabits(currentHabits, backupHabits) {
    const mergedHabits = [...currentHabits];
    backupHabits.forEach(backupHabit => {
        const existingIndex = mergedHabits.findIndex(h => h.id === backupHabit.id);
        if (existingIndex === -1) {
            mergedHabits.push(backupHabit);
        } else {
            const currentHabit = mergedHabits[existingIndex];
            if (backupHabit.updateTime > currentHabit.updateTime) {
                const mergedCompleted = [...new Set([...currentHabit.completed, ...backupHabit.completed])];
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

/**
 * 合并备注数据，按时间降序排列
 */
function mergeNotes(currentNotes, backupNotes) {
    const notesMap = new Map();
    [...currentNotes, ...backupNotes].forEach(note => {
        const key = `${note.timestamp}_${note.content}`;
        const existingNote = notesMap.get(key);
        if (!existingNote || note.saveTimestamp > existingNote.saveTimestamp) {
            notesMap.set(key, note);
        }
    });
    return Array.from(notesMap.values()).sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * 检查是否存在可用的备份数据
 */
export function checkBackupAvailable() {
    try {
        const backup = uni.getStorageSync(BACKUP_KEY);
        if (backup && backup.data) {
            return {
                available: true,
                timestamp: backup.timestamp,
                source: "storage"
            };
        }
        const fs = uni.getFileSystemManager();
        const backupPath = `${uni.env.USER_DATA_PATH}/backups`;
        try {
            const files = fs.readdirSync(backupPath);
            const backupFiles = files.filter(f => f.startsWith("habits_backup_"));
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
            // 忽略错误
        }
        return {
            available: false
        };
    } catch (error) {
        console.error("检查备份失败:", error);
        return {
            available: false,
            error
        };
    }
}