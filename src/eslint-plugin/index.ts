import { Linter } from "@typescript-eslint/utils/ts-eslint";
import { explicitReturnType } from "./explicit-return-type";

export default {
  rules: {
    "explicit-return-type": explicitReturnType,
  },
} satisfies Linter.Plugin;
