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
          <el-button
            v-if="row.contentUrl"
            size="mini"
            @click="previewContentFile(row.contentUrl)"
          >
            预览TXT
          </el-button>
          <span v-else>暂无文件</span>
        </template>
      </el-table-column>
      <el-table-column label="音频文件 (MP3)" prop="mp3File">
        <template #default="{ row }">
          <div v-if="row.mp3Url">
            <!-- 播放按钮 -->
            <el-button size="mini" @click="toggleAudio(row.mp3Url)">
              {{
                isPlaying && currentAudioUrl === row.mp3Url ? "暂停" : "播放"
              }}
            </el-button>
          </div>
          <span v-else>暂无文件</span>
        </template>
      </el-table-column>
      <el-table-column prop="number" label="编号" width="80" />
      <el-table-column prop="rating" label="评分" width="80" />
      <el-table-column prop="viewCount" label="浏览量" width="80" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openDialog(row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="small"
            @click="deleteChapter(row.chapterId)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="编辑章" width="500px">
      <el-form :model="currentChapter" label-width="80px">
        <el-form-item label="章节名">
          <el-input
            v-model="currentChapter.chapterName"
            placeholder="请输入章节名"
          />
        </el-form-item>
        <el-form-item label="编号">
          <el-input-number v-model="currentChapter.number" :min="0" />
        </el-form-item>
        <el-form-item label="评分">
          <el-input-number
            v-model="currentChapter.rating"
            :min="0"
            :max="10"
            :step="0.1"
          />
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
          <el-upload
            class="upload-demo"
            drag
            action=""
            :auto-upload="false"
            :before-upload="beforeTxtUpload"
            :on-change="handleTxtChange"
          >
            <template #trigger>
              <el-button size="small" type="primary">点击上传TXT文件</el-button>
            </template>
            <template #tip> 只能上传txt文件 </template>
          </el-upload>
          <div v-if="currentChapter.contentUrl" style="margin-top: 10px">
            <el-button size="mini" @click="previewContentFile"
              >预览文本文件</el-button
            >
          </div>
        </el-form-item>

        <el-form-item label="音频文件 (MP3)">
          <el-upload
            class="upload-demo"
            drag
            action=""
            :auto-upload="false"
            :before-upload="beforeMp3Upload"
            :on-change="handleMp3Change"
          >
            <template #trigger>
              <el-button size="small" type="primary">点击上传MP3文件</el-button>
            </template>
            <template #tip> 只能上传MP3文件 </template>
          </el-upload>
          <div v-if="currentChapter.mp3Url" style="margin-top: 10px">
            <!-- <audio controls :src="currentChapter.mp3Url" /> -->
          </div>
        </el-form-item>
      </el-form>
      <div style="text-align: right">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveChapter()">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
  
  <script>
import axios from "axios";
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute } from "vue-router";

const BASE_URL = process.env.VUE_APP_API_BASE_URL;

export default {
  setup() {
    const route = useRoute(); // 获取路由信息
    const chapters = ref([]);
    const currentChapter = ref({
      chapterId: null,
      bookId: "",
      scrollId: "",
      number: 0,
      chapterName: "",
      author: "",
      category: "",
      rating: 0,
      status: 1,
      contentUrl: "",
      mp3Url: "",
    });
    const dialogVisible = ref(false);
    const selectedMp3File = ref(null);
    const selectedTxtFile = ref(null);
    const currentAudio = ref(null); // 用于保存当前音频实例
    const isPlaying = ref(false); // 用于跟踪音频是否正在播放
    const currentAudioUrl = ref(""); // 用于记录当前正在播放的音频 URL

    onMounted(() => {
      const bookId = route.query.bookId || "";
      const scrollId = route.query.scrollId || "";
      currentChapter.value.bookId = bookId;
      currentChapter.value.scrollId = scrollId;
      loadChapters(bookId, scrollId);
    });

    // 加载章节列表
    const loadChapters = async (bookId, scrollId) => {
      if (!bookId || !scrollId) {
        console.error("未获取到 bookId 或 scrollId");
        return;
      }
      try {
        const res = await axios.get(
          `${BASE_URL}/chapter/list?bookId=${bookId}&scrollId=${scrollId}`
        );
        chapters.value = res.data || [];
      } catch (error) {
        console.error("加载章节失败:", error);
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
          chapterName: "",
          author: "",
          category: "",
          rating: 0,
          status: 1,
        };
      }
      dialogVisible.value = true;
    };

    // 保存章节
    const saveChapter = async () => {
      try {
        let mp3Url = currentChapter.value.mp3Url;
        let contentUrl = currentChapter.value.contentUrl;
        if (selectedMp3File.value) {
          const formData = new FormData();
          formData.append("file", selectedMp3File.value);
          if (currentChapter.value.chapterId) {
            formData.append("chapterId", currentChapter.value.chapterId);
          }

          const res = await axios.post(
            BASE_URL + "/upload/chapterMp3",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          mp3Url = res.data.url;
        }

        if (selectedTxtFile.value) {
          const formData = new FormData();
          formData.append("file", selectedTxtFile.value);
          if (currentChapter.value.chapterId) {
            formData.append("chapterId", currentChapter.value.chapterId);
          }

          const res = await axios.post(
            BASE_URL + "/upload/chapterTxt",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          contentUrl = res.data.url;
        }

        const chapterData = { ...currentChapter.value, mp3Url, contentUrl };
        if (currentChapter.value.chapterId) {
          await axios.put(`${BASE_URL}/chapter/update`, chapterData);
          // 更新已有章节
          const index = chapters.value.findIndex(
            (chapter) => chapter.chapterId === currentChapter.value.chapterId
          );
          if (index !== -1) {
            chapters.value[index] = chapterData; // 更新数组中的章节
          }
        } else {
          chapterData.scrollId = currentChapter.value.scrollId;
          chapterData.bookId = currentChapter.value.bookId;
          await axios.post(`${BASE_URL}/chapter/add`, chapterData);
          chapters.value.push(chapterData); // 新章节加入数组
        }

        dialogVisible.value = false;
        selectedMp3File.value = null;
        selectedTxtFile.value = null;
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

      ElMessageBox.confirm("确认删除该章节?", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        try {
          await axios.delete(
            `${BASE_URL}/chapter/delete?chapterId=${chapterId}`
          );
          loadChapters(bookId, scrollId);
        } catch (error) {
          console.error("删除章节失败:", error);
        }
      });
    };

    // 预览内容文件
    const previewContentFile = (url) => {
      window.open(`${BASE_URL}/uploads/txt/${url}`, "_blank");
    };
    // 切换播放和暂停
    const toggleAudio = (url) => {
      // 如果音频实例已经存在
      if (currentAudio.value && currentAudioUrl.value === url) {
        if (isPlaying.value) {
          currentAudio.value.pause();
          isPlaying.value = false;
        } else {
          currentAudio.value.play();
          isPlaying.value = true;
        }
      } else {
        // 如果没有音频实例或是不同的音频，创建新的音频并播放
        currentAudio.value = new Audio(
          `${BASE_URL}/uploads/mp3/${encodeURIComponent(url)}`
        );
        currentAudio.value.play();
        isPlaying.value = true;
        currentAudioUrl.value = url;

        // 当音频播放结束时，重置状态
        currentAudio.value.onended = () => {
          isPlaying.value = false;
          currentAudioUrl.value = "";
        };
      }
    };
    // 上传TXT文件前的处理
    const beforeTxtUpload = (file) => {
      console.log("txt", file); // 打印文件信息，确认 `file.type`
      const isTxt = file.type === "text/plain";
      if (!isTxt) {
        ElMessage.error("只能上传TXT文件");
      }
      return isTxt;
    };

    // 上传MP3文件前的处理
    const beforeMp3Upload = (file) => {
      const isMp3 = file.type === "audio/mp3";
      if (!isMp3) {
        ElMessage.error("只能上传MP3文件");
      }
      return isMp3;
    };

    // TXT文件上传事件
    const handleTxtChange = (file) => {
      if (!file.raw) return;
      selectedTxtFile.value = file.raw;

      // 只在新增或更换图片时才更新 coverUrl

      currentChapter.value.contentUrl = URL.createObjectURL(file.raw);
      console.log("更新TXT URL:", currentChapter.value.contentUrl);
    };

    // MP3文件上传事件
    const handleMp3Change = (file) => {
      if (!file.raw) return;
      selectedMp3File.value = file.raw;

      // 只在新增或更换图片时才更新 coverUrl

      currentChapter.value.mp3Url = URL.createObjectURL(file.raw);
      console.log("更新MP3 URL:", currentChapter.value.mp3Url);
    };

    return {
      chapters,
      currentChapter,
      dialogVisible,
      openDialog,
      saveChapter,
      deleteChapter,
      previewContentFile,
      beforeTxtUpload,
      beforeMp3Upload,
      handleTxtChange,
      handleMp3Change,
      toggleAudio,
      isPlaying,
      currentAudioUrl,
    };
  },
};
</script>
  
  <style scoped>
.upload-demo i {
  font-size: 28px;
}
</style>
  