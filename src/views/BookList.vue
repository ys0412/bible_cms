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
            <el-table :data="books" border>
                <el-table-column prop="bookId" label="ID" width="50" />
                <el-table-column prop="bookName" label="书名">
                    <template #default="{ row }">
                        <el-link type="primary" @click="goToBookDetail(row.bookId)">{{
                            row.bookName
                        }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="author" label="作者" />
                <el-table-column prop="category" label="分类" />
                <el-table-column prop="rating" label="评分" width="80" />
                <el-table-column prop="viewCount" label="浏览量" width="80" />
                <el-table-column label="封面" width="100">
                    <template #default="{ row }">
                        <el-image v-if="row.coverUrl" :src="getCoverUrl(row.coverUrl)" style="width: 50px; height: 50px"
                            fit="cover" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
                        <el-button type="danger" size="small" @click="deleteBook(row.bookId)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog v-model="dialogVisible" title="编辑书籍" width="500px">
                <el-form :model="book" label-width="80px">
                    <el-form-item label="书名">
                        <el-input v-model="book.bookName" placeholder="请输入书名" />
                    </el-form-item>
                    <el-form-item label="作者">
                        <el-input v-model="book.author" placeholder="请输入作者" />
                    </el-form-item>
                    <el-form-item label="封面">
                        <el-upload class="avatar-uploader" :show-file-list="false" :auto-upload="false"
                            :before-upload="beforeUpload" :on-change="handleFileChange">
                            <el-image v-if="book.coverUrl" :src="book.coverUrl" style="width: 100px; height: 100px"
                                fit="cover" />
                            <el-button v-else type="primary">选择封面</el-button>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="分类">
                        <el-input v-model="book.category" placeholder="请输入分类" />
                    </el-form-item>
                    <el-form-item label="评分">
                        <el-input-number v-model="book.rating" :min="0" :max="10" :step="0.1" />
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="book.status">
                            <el-option label="下架" :value="0" />
                            <el-option label="上架" :value="1" />
                            <el-option label="审核中" :value="2" />
                        </el-select>
                    </el-form-item>
                </el-form>
                <div style="text-align: right">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveBook()">保存</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted } from "vue";
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
const BASE_URL = process.env.VUE_APP_API_BASE_URL;
console.log("BASE_URL", BASE_URL);
export default {
    components: {
        Plus
    },
    setup() {
        const router = useRouter();
        const books = ref([]);
        const book = ref({
            bookId: null,
            bookName: "",
            author: "",
            coverUrl: "",
            category: "",
            rating: 0,
            status: 1,
        });
        const dialogVisible = ref(false);
        const selectedFile = ref(null);

        // 加载书籍列表
        const loadBooks = async () => {
            try {
                const res = await axios.get("/book/list");
                console.log(res.data);
                books.value = res.data;
            } catch (error) {
                console.error("加载书籍失败:", error);
            }
        };

        const openDialog = (row = null) => {
            if (row) {
                book.value = { ...row }; // 复制已有的书籍数据，确保 `id` 存在
                if (row.coverUrl) {
                    book.value.coverUrl = BASE_URL + `/uploads/${row.coverUrl}`;
                }
            } else {
                book.value = {
                    bookId: null,
                    bookName: "",
                    author: "",
                    coverUrl: "",
                    category: "",
                    rating: 0,
                    status: 1,
                };
            }
            dialogVisible.value = true;
        };

        // 处理文件选择
        const handleFileChange = (file) => {
            console.log("aaaaaaaaaa");

            if (!file.raw) return;
            selectedFile.value = file.raw;

            // 只在新增或更换图片时才更新 coverUrl

            book.value.coverUrl = URL.createObjectURL(file.raw);
            console.log("更新图片 URL:", book.value.coverUrl);
        };

        // 上传前检查
        const beforeUpload = (file) => {
            const isJPG = file.type === "image/jpeg" || file.type === "image/png";
            const isLt2M = file.size / 1024 / 1024 < 2;

            if (!isJPG) {
                ElMessage.error("上传图片只能是 JPG/PNG 格式！");
                return false;
            }
            if (!isLt2M) {
                ElMessage.error("上传图片大小不能超过 2MB！");
                return false;
            }
            return true;
        };

        // 保存书籍
        const saveBook = async () => {
            try {
                let coverUrl = book.value.coverUrl; // 默认使用当前封面 URL

                // **只有当用户选择了新图片时，才上传**
                if (selectedFile.value) {
                    const formData = new FormData();
                    formData.append("file", selectedFile.value);

                    if (book.value.bookId) {
                        formData.append("bookId", book.value.bookId);
                    }

                    const res = await axios.post(
                        BASE_URL + "/upload/bookCover",
                        formData,
                        {
                            headers: { "Content-Type": "multipart/form-data" },
                        }
                    );

                    coverUrl = res.data.url; // 获取上传后返回的新封面 URL
                }

                // **组装书籍数据**
                const bookData = {
                    bookId: book.value.bookId || null,
                    bookName: book.value.bookName,
                    author: book.value.author,
                    category: book.value.category,
                    rating: book.value.rating,
                    status: book.value.status,
                };
                // **如果用户更新了封面，才加上 `coverUrl`**
                if (selectedFile.value) {
                    bookData.coverUrl = coverUrl;
                }

                // **区分新增和更新**
                if (book.value.bookId) {
                    await axios.put("http://localhost:8084/book/update", bookData);
                } else {
                    await axios.post("http://localhost:8084/book/add", bookData);
                }

                dialogVisible.value = false;
                selectedFile.value = null; // 清空已选择的文件
                loadBooks();
            } catch (error) {
                console.error("保存书籍失败:", error);
            }
        };

        // 删除书籍
        const deleteBook = async (bookId) => {
            try {
                await axios.delete(`/book/delete/${bookId}`);
                loadBooks();
            } catch (error) {
                console.error("删除失败:", error);
            }
        };

        // 获取状态文本
        const statusText = (status) => {
            return status === 0 ? "下架" : status === 1 ? "上架" : "审核中";
        };

        const getCoverUrl = (coverUrl) => {
            return coverUrl ? `${BASE_URL}/uploads/${coverUrl}` : "";
        };
        const goToBookDetail = (bookId) => {
            router.push({
                path: "/scroll", // 跳转到 /scroll 路径
                query: { bookId: bookId }, // 使用查询参数传递 bookId
            });
        };
        onMounted(loadBooks);

        return {
            books,
            book,
            dialogVisible,
            openDialog,
            saveBook,
            deleteBook,
            handleFileChange,
            beforeUpload,
            getCoverUrl,
            goToBookDetail,
            statusText,
        };
    },
};
</script>

<style>
.container {
    display: flex;
    flex-direction: column;
}

.avatar-uploader {
    text-align: center;
}
</style>
