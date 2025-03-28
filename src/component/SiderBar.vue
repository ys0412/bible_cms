<template>
    <el-menu default-active="1" class="el-menu-vertical-demo" router>
        <!-- 首页 -->
        <el-menu-item index="/" @click="handleMenuClick('/', '首页')">
            <el-icon>
                <house />
            </el-icon>
            <span>首页</span>
        </el-menu-item>

        <!-- 内容管理 -->
        <el-menu-item index="/books" @click="handleMenuClick('/books', '内容管理')">
            <el-icon>
                <Notebook />
            </el-icon>
            <span>内容管理</span>
        </el-menu-item>

        <!-- 用户管理 -->
        <el-menu-item index="/userManagement" @click="handleMenuClick('/userManagement', '用户管理')">
            <el-icon>
                <user />
            </el-icon>
            <span>用户管理</span>
        </el-menu-item>

        <!-- 系统管理 -->
        <el-menu-item index="/systemManagement" @click="handleMenuClick('/systemManagement', '系统管理')">
            <el-icon>
                <setting />
            </el-icon>
            <span>系统管理</span>
        </el-menu-item>
    </el-menu>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { House, User, Notebook, Setting } from '@element-plus/icons-vue'
import { inject } from 'vue'

const router = useRouter()
const addTab = inject('addTab') // 通过 inject 获取 TabsTop 的 addTab 方法

const handleMenuClick = (path, label) => {
    if (router.currentRoute.value.path !== path) {
        if (typeof addTab.value === 'function') {
            addTab.value(path, label);  // 添加 Tab
        }
        // router.push(path);  // 跳转路由
    }
}
</script>


<style>
.el-menu-vertical-demo {
    width: 220px;
    min-height: 100vh;
    background-color: #f8f9fa;
    border-right: 1px solid #e0e0e0;
}

.el-menu-item span {
    cursor: pointer;
}
</style>
