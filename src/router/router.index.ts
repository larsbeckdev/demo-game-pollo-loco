import { createRouter, createMemoryHistory } from "vue-router";

import DefaultLayout from "@/app/layout/default/_defaultLayout.vue";
import Home from "@/pages/home/Home.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      {
        path: "",
        name: "home",
        component: Home,
      },
    ],
  },
  {
    path: "/impressum",
    component: DefaultLayout,
    children: [
      {
        path: "/impressum",
        name: "impressum",
        component: () => import("@/pages/legal/Imprint.vue"),
      },
    ],
  },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
