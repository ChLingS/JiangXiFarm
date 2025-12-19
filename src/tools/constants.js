// constants.js
export const ADMIN_LEVELS = {
  PROVINCE: 0,
  CITY: 1,
  DISTRICT: 2,
  TOWN: 3,
  VILLAGE: 4
};

export const LEVEL_CONFIG = {
  [ADMIN_LEVELS.PROVINCE]: {
    name: '省',
    nextLevel: ADMIN_LEVELS.CITY,
    isLeaf: false
  },
  [ADMIN_LEVELS.CITY]: {
    name: '市',
    nextLevel: ADMIN_LEVELS.DISTRICT,
    isLeaf: false
  },
  [ADMIN_LEVELS.DISTRICT]: {
    name: '区',
    nextLevel: ADMIN_LEVELS.TOWN,
    isLeaf: false
  },
  [ADMIN_LEVELS.TOWN]: {
    name: '镇',
    nextLevel: ADMIN_LEVELS.VILLAGE,
    isLeaf: false
  },
  [ADMIN_LEVELS.VILLAGE]: {
    name: '村',
    nextLevel: null,
    isLeaf: true
  }
};
