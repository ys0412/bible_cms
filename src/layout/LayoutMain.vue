<template>
    <div class="layout-container">
        <div class="sidebar-view">
            <el-aside>
                <Sidebar />
            </el-aside>
        </div>
        <div class="right-view">
            <div>
                <el-header class="header">
                    <HeadTop />
                </el-header>
            </div>
            <div class="tab-view">
                <TabsTop ref="tabsRef" />
            </div>
            <div>
                <el-main class="main-content">
                    <router-view />
                </el-main>
            </div>

        </div>
    </div>
</template>

<script setup>
import { provide, ref, onMounted, computed } from 'vue'
import Sidebar from "@/component/SiderBar.vue";
import TabsTop from "@/component/TabsTop.vue";
import HeadTop from '@/component/HeadTop.vue';

const tabsRef = ref(null)
onMounted(() => {
    console.log("💡 tabsRef 组件:", tabsRef.value)  // 检查 tabsRef 是否正常引用
    // 确保 tabsRef 被正确引用
    if (tabsRef.value) {
        console.log("💡 tabsRef 组件:", tabsRef.value)
        console.log("💡 addTab 方法:", tabsRef.value.addTab)
        if (typeof tabsRef.value.addTab === 'function') {
            provide('addTab', tabsRef.value.addTab)  // 正确暴露 addTab
        } else {
            console.error("❌ addTab 不是函数，而是一个对象或其它类型")
        }
    } else {
        console.error("❌ tabsRef 为 null")
    }
})

// 改成传统方式获取 addTab 方法
const addTab = computed(() => {
    if (tabsRef.value) {
        return tabsRef.value.addTab
    }
    return undefined
})

// 直接 provide，computed 会自动更新
provide('addTab', addTab)
</script>
<style scoped>
.layout-container {
    display: flex;
    flex-direction: row;
    /* 关键改动：横向排列 */
    height: 100vh;
}

.sidebar-view {
    width: 240px;
    height: 100%;
    /* 继承父容器高度 */
}

.right-view {
    flex: 1;
    /* 关键属性：占据剩余宽度 */
    height: 100%;
    /* 继承高度 */
}

/* 调整 Element Plus 组件默认样式 */
.el-aside {
    width: 100% !important;
    /* 强制侧边栏填满容器 */
    height: 100%;
}

.el-container {
    height: 100%;
}
</style>
