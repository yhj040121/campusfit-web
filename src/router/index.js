import { createRouter, createWebHistory } from "vue-router";
import WebLayout from "../layouts/WebLayout.vue";
import HomeView from "../views/HomeView.vue";
import ActivitiesView from "../views/ActivitiesView.vue";
import ActivityDetailView from "../views/ActivityDetailView.vue";
import PostDetailView from "../views/PostDetailView.vue";
import PublishView from "../views/PublishView.vue";
import ProfileView from "../views/ProfileView.vue";

const routes = [
  {
    path: "/",
    component: WebLayout,
    children: [
      {
        path: "",
        name: "home",
        component: HomeView,
        meta: { title: "首页" }
      },
      {
        path: "activities",
        name: "activities",
        component: ActivitiesView,
        meta: { title: "活动中心" }
      },
      {
        path: "activities/:id",
        name: "activity-detail",
        component: ActivityDetailView,
        meta: { title: "活动详情" }
      },
      {
        path: "posts/:id",
        name: "post-detail",
        component: PostDetailView,
        meta: { title: "内容详情" }
      },
      {
        path: "publish",
        name: "publish",
        component: PublishView,
        meta: { title: "发布" }
      },
      {
        path: "profile",
        name: "profile",
        component: ProfileView,
        meta: { title: "我的" }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.afterEach((to) => {
  document.title = `${to.meta?.title || "青搭 Web"} - 青搭`;
});

export default router;
