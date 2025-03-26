<template>
    <div>
        <el-button type="primary" @click="openDialog()">添加章</el-button>
        <el-table :data="chapters" border>
            <el-table-column prop="chapterId" label="ID" width="50" />
            <el-table-column prop="chapterName" label="章节名">
                <template #default="{ row }">
                    <span>{{ row.chapterName }}</span>
                </template>
            </el-table-column>
            <el-table-column label="内容文件 (TXT)" prop="contentFile">
                <template #default="{ row }">
                    <el-button v-if="row.contentUrl" size="mini" @click="previewContentFile(row.contentUrl)">
                        预览TXT
                    </el-button>
                    <span v-else>暂无文件</span>
                </template>
            </el-table-column>
            <el-table-column label="音频文件 (MP3)" prop="mp3File">
                <template #default="{ row }">
                    <el-button v-if="row.mp3Url" size="mini" @click="previewMp3File(row.mp3Url)">
                        预览MP3
                    </el-button>
                    <span v-else>暂无文件</span>
                </template>
            </el-table-column>
            <el-table-column prop="number" label="编号" width="80" />
            <el-table-column prop="rating" label="评分" width="80" />
            <el-table-column prop="viewCount" label="浏览量" width="80" />
            <el-table-column label="操作" width="180">
                <template #default="{ row }">
                    <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="deleteChapter(row.chapterId)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog v-model="dialogVisible" title="编辑章" width="500px">
            <el-form :model="currentChapter" label-width="80px">
                <el-form-item label="章节名">
                    <el-input v-model="currentChapter.chapterName" placeholder="请输入章节名" />
                </el-form-item>
                <el-form-item label="编号">
                    <el-input-number v-model="currentChapter.number" :min="0" />
                </el-form-item>
                <el-form-item label="评分">
                    <el-input-number v-model="currentChapter.rating" :min="0" :max="10" :step="0.1" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="currentChapter.status">
                        <el-option label="下架" :value="0" />
                        <el-option label="上架" :value="1" />
                        <el-option label="审核中" :value="2" />
                    </el-select>
                </el-form-item>
                <!-- 文件上传 -->
                <el-form-item label="内容文件 (TXT)">
                    <el-upload class="upload-demo" drag action="" :before-upload="beforeTxtUpload"
                        :on-change="handleTxtChange">
                        <template #trigger>
                            <el-button size="small" type="primary">点击上传TXT文件</el-button>
                        </template>
                        <template #tip>
                            只能上传txt文件
                        </template>
                    </el-upload>
                    <div v-if="currentChapter.contentUrl" style="margin-top: 10px;">
                        <el-button size="mini" @click="previewContentFile">预览文本文件</el-button>
                    </div>
                </el-form-item>

                <el-form-item label="音频文件 (MP3)">
                    <el-upload class="upload-demo" drag action="" :before-upload="beforeMp3Upload"
                        :on-change="handleMp3Change">
                        <template #trigger>
                            <el-button size="small" type="primary">点击上传MP3文件</el-button>
                        </template>
                        <template #tip>
                            只能上传MP3文件
                        </template>
                    </el-upload>
                    <div v-if="currentChapter.mp3Url" style="margin-top: 10px;">
                        <audio controls :src="currentChapter.mp3Url" />
                    </div>
                </el-form-item>
            </el-form>
            <div style="text-align: right;">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveChapter()">保存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoute } from 'vue-router';

const BASE_URL = process.env.VUE_APP_API_BASE_URL;

export default {
    setup() {
        const route = useRoute(); // 获取路由信息
        const chapters = ref([]);
        const currentChapter = ref({
            chapterId: null,
            bookId: '',
            scrollId: '',
            number: 0,
            chapterName: '',
            author: '',
            category: '',
            rating: 0,
            status: 1,
            contentUrl: '',
            mp3Url: ''
        });
        const dialogVisible = ref(false);
        const selectedFile = ref(null);

        onMounted(() => {
            const bookId = route.query.bookId || '';
            const scrollId = route.query.scrollId || '';
            currentChapter.value.bookId = bookId;
            currentChapter.value.scrollId = scrollId;
            loadChapters(bookId, scrollId);
        });

        // 加载章节列表
        const loadChapters = async (bookId, scrollId) => {
            if (!bookId || !scrollId) {
                console.error('未获取到 bookId 或 scrollId');
                return;
            }
            try {
                const res = await axios.get(`${BASE_URL}/chapter/list?bookId=${bookId}&scrollId=${scrollId}`);
                chapters.value = res.data || [];
            } catch (error) {
                console.error('加载章节失败:', error);
            }
        };

        // 打开编辑或添加章节的对话框
        const openDialog = (row = null) => {
            if (row) {
                currentChapter.value = { ...row };
            } else {
                currentChapter.value = {
                    chapterId: null,
                    bookId: route.query.bookId,
                    scrollId: route.query.scrollId,
                    number: 0,
                    chapterName: '',
                    author: '',
                    category: '',
                    rating: 0,
                    status: 1
                };
            }
            dialogVisible.value = true;
        };

        // 保存章节
        const saveChapter = async () => {
            try {
                let mp3Url = currentChapter.value.mp3Url;  // 使用 let 而不是 const
                if (selectedFile.value) {
                    const formData = new FormData();
                    formData.append("file", selectedFile.value);

                    if (currentChapter.value.chapterId) {
                        formData.append("chapterId", currentChapter.value.chapterId);
                    }

                    const res = await axios.post(BASE_URL + "/upload/chapterMp3", formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                    });

                    mp3Url = res.data.url;  // 这里应该更新为上传后的URL
                }

                const chapterData = { ...currentChapter.value, mp3Url };  // 确保将更新后的 mp3Url 提交
                if (currentChapter.value.chapterId) {
                    await axios.put(`${BASE_URL}/chapter/update`, chapterData);
                } else {
                    chapterData.scrollId = currentChapter.value.scrollId;
                    chapterData.bookId = currentChapter.value.bookId;
                    await axios.post(`${BASE_URL}/chapter/add`, chapterData);
                }

                dialogVisible.value = false;
                loadChapters(currentChapter.value.bookId, currentChapter.value.scrollId);
                selectedFile.value = null; // 清空已选择的文件
            } catch (error) {
                console.error("保存章节失败:", error);
            }
        };


        // 删除章节
        const deleteChapter = async (chapterId) => {
            const bookId = route.query.bookId || currentChapter.value.bookId;
            const scrollId = route.query.scrollId || currentChapter.value.scrollId;

            if (!bookId || !scrollId) {
                console.error("bookId 或 scrollId 不能为空！");
                return;
            }

            ElMessageBox.confirm('确定要删除该章节吗？', '警告', {
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                type: 'warning',
            })
                .then(async () => {
                    try {
                        await axios.delete(`${BASE_URL}/chapter/delete/${chapterId}`);
                        loadChapters(bookId, scrollId);
                        ElMessage.success('删除成功');
                    } catch (error) {
                        console.error('删除章节失败:', error);
                        ElMessage.error('删除失败，请检查网络');
                    }
                })
                .catch(() => {
                    console.log('取消删除');
                });
        };

        // 上传前检查TXT文件
        const beforeTxtUpload = (file) => {
            const isTxt = file.type === 'text/plain';
            const isLt5M = file.size / 1024 / 1024 < 5;

            if (!isTxt) {
                ElMessage.error('上传文件只能是 TXT 格式！');
                return false;
            }
            if (!isLt5M) {
                ElMessage.error('上传文件大小不能超过 5MB！');
                return false;
            }
            return true;
        };

        // 上传前检查MP3文件
        const beforeMp3Upload = (file) => {
            console.log(" file.type" + file.type);
            const isMp3 = file.type === 'audio/mp3' || file.type === 'audio/mpeg'; // 允许 'audio/mpeg'
            const isLt10M = file.size / 1024 / 1024 < 10;

            if (!isMp3) {
                ElMessage.error('上传文件只能是 MP3 格式！');
                return false;
            }
            if (!isLt10M) {
                ElMessage.error('上传文件大小不能超过 10MB！');
                return false;
            }
            return true;
        };

        // 处理TXT选择
        const handleTxtChange = (file) => {
            if (!file.raw) return;
            selectedFile.value = file.raw;
            // 只在新增或更换TXT时才更新 coverUrl
            currentChapter.value.contentUrl = URL.createObjectURL(file.raw);
            console.log("更新TXT URL:", currentChapter.value.contentUrl);
        };

        // 预览TXT文件
        const previewContentFile = () => {
            if (currentChapter.value.contentUrl) {
                window.open(currentChapter.value.contentUrl, '_blank');
            }
        };

        // 处理MP3选择
        const handleMp3Change = (file) => {
            if (!file.raw) return;
            selectedFile.value = file.raw;
            // 只在新增或更换MP3时才更新 mp3Url
            currentChapter.value.mp3Url = URL.createObjectURL(file.raw);
            console.log("更新MP3 URL:", currentChapter.value.mp3Url);
        };
        // 预览MP3文件
        const previewMp3File = () => {
            if (currentChapter.value.mp3Url) {
                window.open(currentChapter.value.mp3Url, '_blank');
            }
        };

        return {
            chapters,
            currentChapter,
            dialogVisible,
            openDialog,
            saveChapter,
            deleteChapter,
            beforeTxtUpload,
            beforeMp3Upload,
            previewContentFile,
            previewMp3File,
            handleTxtChange,
            handleMp3Change
        };
    }
};
</script>

<style scoped>
.upload-demo i {
    font-size: 24px;
    color: #409eff;
}
</style>
