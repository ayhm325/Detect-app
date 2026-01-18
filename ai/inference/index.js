// ai/inference/index.js
// Model switcher: choose between mock and real (Python) implementations.
import { runMockModel } from "./mockModel.js";
import { runPyModel } from "./pyModel.js";

const useMock = (process.env.AI_USE_MOCK || "true").toLowerCase() !== "false";

function getModel() {
  if (useMock) {
    return {
      infer: async (prepared, opts = {}) => {
        return await runMockModel(prepared.buffer);
      },
      name: "mock",
    };
  }

  return {
    infer: async (prepared, opts = {}) => {
      return await runPyModel(prepared, opts);
    },
    name: "python",
  };
}

export { getModel, useMock };
