import { Construct } from "constructs";
import {
  Stack,
  StackProps,
  aws_iam as iam,
  aws_codeconnections as codeconnections,
  aws_codebuild as codebuild,
} from "aws-cdk-lib";

export interface CodebuildTestingStackProps extends StackProps {
  application_name: string;
  environment_name: string;
  region: string;
}

export class CodebuildTestingStack extends Stack {
  constructor(scope: Construct, id: string, props: CodebuildTestingStackProps) {
    super(scope, id, props);
    const { application_name, environment_name, region } = props;
    // Creation of a Gitlab Connection.
    const gitlab_connection = new codeconnections.CfnConnection(
      this,
      `connection-${application_name}-${environment_name}-${region}`,
      {
        connectionName: `gitlab-connection`, // maxLength = 32 chars
        providerType: "GitLab",
      }
    );
    // Creating a role for Codebuild.
    const codebuild_role = new iam.Role(
      this,
      `role-${application_name}-${environment_name}-${region}`,
      {
        roleName: `role-${application_name}-${environment_name}-${region}-01`,
        assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      }
    );
    // Allow Codebuild to Write Logs.
    const logs_policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["logs:*"],
      resources: [
        `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/codebuild/codebuild-*`,
      ],
    });
    const codeconnection_policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["codeconnections:UseConnection"],
      resources: [gitlab_connection.attrConnectionArn],
    });
    codebuild_role.addToPolicy(logs_policy);
    codebuild_role.addToPolicy(codeconnection_policy);
    // Configuration of Source Property.
    const sourceProperty: codebuild.CfnProject.SourceProperty = {
      type: "GITLAB",
      // auth: {
      //   type: "CODECONNECTIONS",
      // },
      location: "https://gitlab.com/concept-coding/aws-codeconnection-gitlab",
      buildSpec: "./lib/buildspec/test.yml",
    };
    // Configuration of Environment Property
    const environmentProperty: codebuild.CfnProject.EnvironmentProperty = {
      computeType: "BUILD_GENERAL1_SMALL",
      image: "aws/codebuild/standard:7.0",
      type: "LINUX_CONTAINER",
    };
    // Creating an Codebuild
    const test_codebuild = new codebuild.CfnProject(
      this,
      `codebuild-${application_name}-${environment_name}-${region}`,
      {
        name: `codebuild-${application_name}-${environment_name}-${region}-01`,
        artifacts: {
          type: "NO_ARTIFACTS",
        },
        environment: environmentProperty,
        source: sourceProperty,
        serviceRole: codebuild_role.roleArn,
      }
    );
  }
}
