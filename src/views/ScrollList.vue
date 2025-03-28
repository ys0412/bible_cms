<template>
    <div class="container">
        <div class="button-view">
            <el-button type="primary" class="transparent-button" @click="openDialog"
                style="display: flex; align-items: center;">
                <el-icon style="margin-right: 1px;"> <!-- 给图标添加右边距 -->
                    <Plus />
                </el-icon>
                <span style="margin-top: 2px;">新增</span> <!-- 调整文本位置 -->
            </el-button>
        </div>
        <div class="form-view">
            <el-table :data="scrolls" border>
                <el-table-column prop="scrollId" label="ID" width="50" />
                <el-table-column prop="scrollName" label="卷名">
                    <template #default="{ row }">
                        <el-link type="primary" @click="goToScrollDetail(row.scrollId)">{{ row.scrollName }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="author" label="作者" />
                <el-table-column prop="category" label="分类" />
                <el-table-column prop="rating" label="评分" width="80" />
                <el-table-column prop="viewCount" label="浏览量" width="80" />
                <el-table-column label="封面" width="100">
                    <template #default="{ row }">
                        <el-image v-if="row.coverUrl" :src="getCoverUrl(row.coverUrl)"
                            style="width: 50px; height: 50px;" fit="cover" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
                        <el-button type="danger" size="small" @click="deleteScroll(row.scrollId)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog v-model="dialogVisible" title="编辑卷" width="500px">
                <el-form :model="currentScroll" label-width="80px">
                    <el-form-item label="卷名">
                        <el-input v-model="currentScroll.scrollName" placeholder="请输入卷名" />
                    </el-form-item>
                    <el-form-item label="作者">
                        <el-input v-model="currentScroll.author" placeholder="请输入作者" />
                    </el-form-item>
                    <el-form-item label="封面">
                        <el-upload class="avatar-uploader" :show-file-list="false" :auto-upload="false"
                            :before-upload="beforeUpload" :on-change="handleFileChange">
                            <el-image v-if="currentScroll.coverUrl" :src="currentScroll.coverUrl"
                                style="width: 100px; height: 100px;" fit="cover" />
                            <el-button v-else type="primary">选择封面</el-button>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="分类">
                        <el-input v-model="currentScroll.category" placeholder="请输入分类" />
                    </el-form-item>
                    <el-form-item label="评分">
                        <el-input-number v-model="currentScroll.rating" :min="0" :max="10" :step="0.1" />
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="currentScroll.status">
                            <el-option label="下架" :value="0" />
                            <el-option label="上架" :value="1" />
                            <el-option label="审核中" :value="2" />
                        </el-select>
                    </el-form-item>
                </el-form>
                <div style="text-align: right;">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveScroll()">保存</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { Plus } from '@element-plus/icons-vue'
const BASE_URL = process.env.VUE_APP_API_BASE_URL;

export default {
    components: {
        Plus
    },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const scrolls = ref([]);
        const currentScroll = ref({
            scrollId: null,
            bookId: route.params.bookId,
            scrollName: '',
            author: '',
            coverUrl: '',
            category: '',
            rating: 0,
            status: 1
        });
        const dialogVisible = ref(false);
        const selectedFile = ref(null);
        const bookId = ref(route.query.bookId); // 从路由参数获取 bookId
        console.log('bookId', bookId.value)

        const loadScrolls = async () => {
            if (!bookId.value) {
                console.error('未获取到 bookId');
                return;
            }
            try {
                const res = await axios.get(`${BASE_URL}/scroll/list/${bookId.value}`);
                scrolls.value = res.data || [];  // 确保数据非 null
            } catch (error) {
                console.error('加载卷失败:', error);
            }
        };

        // 在组件挂载后调用 loadScrolls
        onMounted(() => {
            loadScrolls();
        });

        const openDialog = (row = null) => {
            if (row) {
                currentScroll.value = { ...row };
                if (row.coverUrl) {
                    currentScroll.value.coverUrl = BASE_URL + `/uploads/${row.coverUrl}`;
                }
            } else {
                currentScroll.value = { scrollId: null, bookId: route.query.bookId, scrollName: '', author: '', coverUrl: '', category: '', rating: 0, status: 1 };
            }
            dialogVisible.value = true;
        };

        const handleFileChange = (file) => {
            if (!file.raw) return;
            selectedFile.value = file.raw;
            currentScroll.value.coverUrl = URL.createObjectURL(file.raw);  // 临时预览文件
        };

        const beforeUpload = (file) => {
            const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isJPG || !isLt2M) {
                ElMessage.error(isJPG ? '上传图片大小不能超过 2MB！' : '上传图片只能是 JPG/PNG 格式！');
                return false;
            }
            return true;
        };

        const saveScroll = async () => {
            try {
                let coverUrl = currentScroll.value.coverUrl;
                if (selectedFile.value) {
                    const formData = new FormData();
                    formData.append('file', selectedFile.value);
                    if (currentScroll.value.scrollId) formData.append('scrollId', currentScroll.value.scrollId);
                    const res = await axios.post(BASE_URL + '/upload/scrollCover', formData);
                    coverUrl = res.data.url;
                }
                const scrollData = { ...currentScroll.value, coverUrl };
                if (currentScroll.value.scrollId) {
                    await axios.put(BASE_URL + '/scroll/update', scrollData);
                } else {
                    await axios.post(BASE_URL + '/scroll/add', scrollData);
                }
                dialogVisible.value = false;
                selectedFile.value = null;
                loadScrolls();
            } catch (error) {
                console.error('保存卷失败:', error);
            }
        };

        const deleteScroll = async (scrollId) => {
            try {
                await axios.delete(BASE_URL + `/scroll/delete/${scrollId}`);
                loadScrolls();
            } catch (error) {
                console.error('删除卷失败:', error);
            }
        };

        const getCoverUrl = (coverUrl) => {
            return coverUrl ? `${BASE_URL}/uploads/${coverUrl}` : "";
        };
        const goToScrollDetail = (scrollId) => {
            router.push({
                path: '/chapter', // 跳转到 /chapter 路径
                query: {
                    bookId: route.query.bookId, // 获取当前路由参数中的 bookId
                    scrollId: scrollId // 使用你传入的 scrollId
                }
            });
        };
        onMounted(loadScrolls);
        return { scrolls, currentScroll, dialogVisible, openDialog, saveScroll, deleteScroll, handleFileChange, beforeUpload, getCoverUrl, loadScrolls, goToScrollDetail };
    }
};
</script>
<style scoped>
.container {
    display: flex;
    flex-direction: column;
}
</style>
