<template>
    <div class="welcome-container">
        <div class="welcome-header">
            <h1>欢迎使用 金书 管理系统</h1>
        </div>

        <div class="welcome-content">
            <p>这是一段简短的介绍，展示你的项目功能。</p>
        </div>
    </div>
</template>

<script>
export default {
};
</script>

<style scoped>
.welcome-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f4f7fc;
}

.welcome-header {
    text-align: center;
    margin-bottom: 20px;
}

.welcome-header h1 {
    font-size: 36px;
    color: #409EFF;
}

.welcome-content {
    text-align: center;
}

.welcome-content p {
    font-size: 18px;
    margin-bottom: 20px;
    color: #333;
}

.el-button {
    font-size: 16px;
}
</style>