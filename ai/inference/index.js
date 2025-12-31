// Phase 1 placeholder: index.js (model switcher)
// No logic here in Phase 1. This file reserves the model switching entrypoint.
// model switcher - choose between mock and real model implementations
const mockModel = require('./mockModel');

const useMock = (process.env.AI_USE_MOCK || 'true').toLowerCase() !== 'false';

module.exports = {
  getModel() {
    return useMock ? mockModel : null;
  },
  isMock: useMock
};
