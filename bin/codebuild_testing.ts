#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CodebuildTestingStack } from "../lib/codebuild_testing-stack";

const app = new cdk.App();
const tags = {
  Project: "CodeBuild Testing Stack",
  CreatedBy: "Concept Coding Geeks",
  RepositoryLink: "https://github.com/concept-coding-geeks/IAM-Setup",
  CDKVersion: "1.0",
};
new CodebuildTestingStack(app, "CodebuildTestingStack", {
  application_name: "codebuildTestingStack",
  environment_name: "sbx",
  tags: tags,
  region: "ue1",
  env: { account: "851725296158", region: "us-east-1" },
});
