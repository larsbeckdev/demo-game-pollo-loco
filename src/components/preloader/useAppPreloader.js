import { ref } from "vue";

const visible = ref(true);
const progress = ref(0);
const message = ref("Preparing application...");

export function useAppPreloader() {
  function setProgress(value, msg) {
    progress.value = value;
    if (msg) message.value = msg;
  }

  function finish() {
    progress.value = 1;
    setTimeout(() => {
      visible.value = false;
    }, 300);
  }

  function show(msg = "Preparing application...") {
    message.value = msg;
    progress.value = 0;
    visible.value = true;
  }

  return {
    visible,
    progress,
    message,
    setProgress,
    finish,
    show,
  };
}
