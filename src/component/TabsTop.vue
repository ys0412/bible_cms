<template>
    <el-tabs v-model="activeTab" type="card" closable @tab-remove="handleTabRemove" @tab-change="handleTabChange">
        <el-tab-pane v-for="(tab) in tabs" :key="tab.name" :label="tab.label" :name="tab.name"
            :closable="tab.name !== '/'" :class="{ 'no-close': tab.name === '/' }">
        </el-tab-pane>
    </el-tabs>
</template>

<script setup>
import { ref, defineExpose } from 'vue'
import { useRouter } from 'vue-router'


const tabs = ref([
    { label: "首页", name: "/" }  // 首页默认存在
])
const activeTab = ref("/")
const router = useRouter();

// 添加新的 Tab
const addTab = (path, label) => {
    if (!tabs.value.find(tab => tab.name === path)) {
        tabs.value.push({ label, name: path })
    }
    activeTab.value = path
}

// 移除 Tab 时的处理逻辑
const handleTabRemove = (targetName) => {
    if (targetName === "/") {
        // 禁止移除首页
        return
    }
    const index = tabs.value.findIndex(tab => tab.name === targetName)
    if (index > -1) {
        tabs.value.splice(index, 1)
        // 如果删除的是当前激活的 Tab，切换到最后一个 Tab 或首页
        if (activeTab.value === targetName) {
            // 如果有其他 Tab 则激活最后一个 Tab，否则跳转到首页
            activeTab.value = tabs.value.length > 0 ? tabs.value[tabs.value.length - 1].name : '/'
        }
    }

    // 删除 Tab 后同步路由
    router.push(activeTab.value)  // 跳转到剩余的 Tab 路由
}

// 处理 Tab 切换
const handleTabChange = (newTab) => {
    activeTab.value = newTab
    router.push(newTab)  // 切换路由
}
// 让父组件可以调用 `addTab()`
defineExpose({ addTab })
</script>

<style scoped>
.no-close .el-icon-close {
    display: none !important;
}
</style>