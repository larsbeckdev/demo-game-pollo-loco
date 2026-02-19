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
        name: "game",
        component: Home,
      },
    ],
  },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
