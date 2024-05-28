import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator((name) => name);

export const explicitReturnType = createRule({
  name: "explicit-return-type",
  meta: {
    docs: {
      description: "createMockBuilder should use explicit return type instead of generics.",
      recommended: "recommended",
    },
    messages: {
      move: "Move this type to the return.",
    },
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === "Identifier" && node.callee.name === "createMockBuilder") {
          if (node.typeArguments) {
            for (const typeArgument of node.typeArguments.params) {
              context.report({
                node: typeArgument,
                messageId: "move",
              });
            }
          }
        }
      },
    };
  },
});
