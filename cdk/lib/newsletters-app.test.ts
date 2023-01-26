import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { NewslettersApp } from "./newsletters-app";

describe("The NewslettersApp stack", () => {
  it("matches the snapshot", () => {
    const app = new App();
    const stack = new NewslettersApp(app, "NewslettersApp", { stack: "newsletters", stage: "TEST" });
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});
