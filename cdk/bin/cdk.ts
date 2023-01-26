import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { NewslettersApp } from "../lib/newsletters-app";

const app = new App();
new NewslettersApp(app, "NewslettersApp-DEV", { stack: "newsletters", stage: "DEV" });
