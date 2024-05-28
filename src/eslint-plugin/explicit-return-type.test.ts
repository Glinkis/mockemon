import { afterAll, describe, it } from "bun:test";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { rule } from "./explicit-return-type";

RuleTester.it = it;
RuleTester.describe = describe;
RuleTester.afterAll = afterAll;

const ruleTester = new RuleTester();

ruleTester.run("explicit-return-type", rule, {
  valid: [
    {
      code: `
        createMockBuilder(() => "")

        createMockBuilder((f) => "")

        createMockBuilder((): string => "")

        createMockBuilder((f): string => "")
      `,
    },
  ],
  invalid: [
    {
      code: `
        createMockBuilder<string>(() => "");

        createMockBuilder<string>((f) => "");

        type Person = { name: string };
        createMockBuilder<Person>((f) => ({
          name: "John Doe",
        }));

        createMockBuilder<Person>(function b(f) {
          return {
            name: "John Doe",
          };
        });
      `,
      errors: [
        { messageId: "move" }, //
        { messageId: "move" },
        { messageId: "move" },
        { messageId: "move" },
      ],
    },
  ],
});
