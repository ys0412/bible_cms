<template>
    <div class="top-bar">
        <!-- 左侧区域: 显示当前路由 -->
        <div class="left">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index" :to="{ path: item.path }">
                    {{ item.name }}
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <!-- 右侧区域: 显示用户头像和名称 -->
        <div class="right">
            <el-dropdown trigger="click" @command="handleCommand">
                <span class="avatar">
                    <img :src="user.avatarUrl" alt="Avatar" />
                    <span>{{ user.name }}</span>
                </span>
                <!-- 修改: 使用 <template> 来包装具名插槽 -->
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="goProfile">个人中心</el-dropdown-item>
                        <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, computed } from 'vue';
import { ElBreadcrumb, ElBreadcrumbItem, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';

const router = useRouter();
const route = useRoute();

// 模拟当前用户的信息
const user = ref({
    avatarUrl: 'https://i.pravatar.cc/150?img=3', // 用户头像URL（可以替换为真实数据）
    name: 'John Doe', // 用户名
});

// 动态计算面包屑（根据当前路由）
const breadcrumbItems = computed(() => {
    const paths = route.path.split('/').filter(item => item); // 获取路径并去除空值
    const breadcrumbList = paths.map((item, index) => ({
        name: item.charAt(0).toUpperCase() + item.slice(1), // 让每个路径的第一个字母大写
        path: '/' + paths.slice(0, index + 1).join('/'),
    }));
    return breadcrumbList;
});

// 处理退出登录逻辑
const handleLogout = () => {
    // 在这里处理退出登录的逻辑（清除 token、用户信息等）
    console.log('Logging out...');
    // 假设退出后跳转到登录页面
    router.push('/login');
};

// 跳转到个人中心
const goProfile = () => {
    router.push('/profile');
};

// 可扩展的命令处理
const handleCommand = (command) => {
    console.log('Command received:', command);
};
</script>

<style scoped>
.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: white;
    color: white;
}

.left {
    flex: 1;
}

.right {
    display: flex;
    align-items: center;
}

.avatar {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.avatar img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 10px;
}

.el-dropdown-menu {
    min-width: 160px;
}

.el-dropdown-item {
    padding: 8px 20px;
}

.el-breadcrumb {
    margin: 0;
    font-size: 14px;
}

.el-breadcrumb-item {
    font-size: 14px;
}
</style>