import { reactive, readonly } from 'vue';

const STATE = reactive({
  AD_NAMES: []
});

export const globalStore = {
  state: readonly(STATE),
  setList(newList) {
    STATE.AD_NAMES = newList;
  },
  addItem(item) {
    STATE.AD_NAMES.push(item);
  },
  getLength() {
    return STATE.AD_NAMES.length;
  }
};
