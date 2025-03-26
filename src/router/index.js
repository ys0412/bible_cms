import { createRouter, createWebHistory } from 'vue-router';
import HomeIndex from '@/views/HomeIndex.vue';
import BookList from '../views/BookList.vue';
import ScrollList from '@/views/ScrollList.vue';
import ChapterList from '@/views/ChapterList.vue';

const routes = [
  { path: '/', component: HomeIndex },
  { path: '/books', component: BookList },
  { path: '/scroll', component: ScrollList },
  { path: '/chapter', component: ChapterList }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
