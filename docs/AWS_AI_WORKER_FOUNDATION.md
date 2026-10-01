# AWS AI Worker Foundation

Issue: #829  
Parent epic: #827

This document defines the AWS foundation required before Prompt Studio deploys Image, Video, and Web generation workers to Amazon ECS on AWS Fargate.

No AWS credentials, API keys, secret values, account IDs, or generated ARNs belong in this repository.

## Scope

Issue #829 prepares:

- isolated development, preview, and production naming/configuration;
- Amazon ECR repositories for worker container images;
- separate ECS task execution and application task IAM roles;
- AWS Secrets Manager naming and access boundaries;
- resource tags and cost-allocation conventions;
- budget/credit guardrails and a reproducible operator checklist.

SQS topology/DLQs are intentionally handled by #830. ECS/Fargate worker runtime and task definitions are handled by #831.

## Environment and naming convention

Use one AWS account per environment when available. If the current AWS setup uses a single account, keep resources isolated by environment and IAM resource ARNs.

Recommended variables:

```text
APP=prompt-studio
ENV=dev|preview|prod
AWS_REGION=<selected region>
```

Resource names:

```text
prompt-studio-<env>-image-worker
prompt-studio-<env>-video-worker
prompt-studio-<env>-web-worker

prompt-studio-<env>-ecs-task-execution
prompt-studio-<env>-generation-worker

/prompt-studio/<env>/ai-providers
/prompt-studio/<env>/mongodb
/prompt-studio/<env>/r2
```

Select one primary AWS Region for the first migration and keep ECR, ECS/Fargate, Secrets Manager, CloudWatch, and later SQS in that Region unless there is a documented reason not to.

## Required tags

Apply these tags to AWS resources where supported:

```text
Application=prompt-studio
Environment=dev|preview|prod
Workload=ai-generation
ManagedBy=manual|iac
Epic=827
CostCenter=ai-generation
```

Add `Worker=image|video|web` to workload-specific resources.

## Amazon ECR

Create one private ECR repository per worker and environment:

```text
prompt-studio-dev-image-worker
prompt-studio-dev-video-worker
prompt-studio-dev-web-worker

prompt-studio-preview-image-worker
prompt-studio-preview-video-worker
prompt-studio-preview-web-worker

prompt-studio-prod-image-worker
prompt-studio-prod-video-worker
prompt-studio-prod-web-worker
```

Configuration requirements:

- enable image scanning;
- use immutable release tags for production;
- add lifecycle rules to remove old untagged/non-release images;
- do not make worker repositories public;
- do not grant worker application code ECR permissions merely to pull its image. Image pull permissions belong to the ECS task execution role.

The first synthetic image is built/pushed as part of #831; #829 only establishes the repositories and access model.

## IAM role separation

Use two distinct roles.

### ECS task execution role

Suggested name:

```text
prompt-studio-<env>-ecs-task-execution
```

Purpose: permissions used by ECS/Fargate infrastructure, not by application code.

Attach the AWS-managed `AmazonECSTaskExecutionRolePolicy` as the baseline. Add narrowly scoped permissions only when required, including `secretsmanager:GetSecretValue` for the exact secrets referenced by task definitions. Add `kms:Decrypt` only if a customer-managed KMS key is used.

Do not attach AdministratorAccess or broad application permissions.

### Generation worker task role

Suggested name:

```text
prompt-studio-<env>-generation-worker
```

Purpose: AWS permissions used by code running inside the worker.

For #829 this role should be minimal. SQS receive/delete/change-visibility permissions are added and resource-scoped in #830 after queue ARNs exist. Add no ECR pull permission to this role unless application code explicitly calls ECR APIs.

Keep the trust policy limited to ECS tasks.

## Secrets Manager

Store server-side worker secrets in Secrets Manager. Never commit their values.

Recommended secret groups:

```text
/prompt-studio/<env>/ai-providers
/prompt-studio/<env>/mongodb
/prompt-studio/<env>/r2
```

The actual keys inside these secrets should match only the variables required by the worker runtime. Examples may include provider API keys, MongoDB connection configuration, and R2 server credentials.

Rules:

- create separate secrets per environment;
- production workers cannot read dev/preview secrets and vice versa;
- grant `secretsmanager:GetSecretValue` only for the environment-specific secret ARNs;
- do not print secret values in CloudWatch or CI logs;
- rotate a secret by creating/updating it in Secrets Manager and redeploying/restarting affected tasks as required;
- never copy real secret values into GitHub issues or pull requests.

## Cost and AWS credit guardrails

Before starting paid Fargate workloads:

1. Enable AWS cost allocation tags used above.
2. Create an AWS Budget for the migration account/environment.
3. Configure notifications before the expected monthly limit is reached.
4. Review AWS Credits in Billing and confirm which services/charges the available credit applies to.
5. Keep dev/preview worker desired counts at zero when idle until workload behavior requires otherwise.
6. Review CloudWatch log retention so development logs are not retained indefinitely.

Issue #842 owns the final production budget/alert and unit-economics implementation. This issue establishes the convention and initial guardrail.

## Operator checklist

Complete these steps in the AWS console or infrastructure-as-code before closing #829.

### Account and region

- [ ] Confirm AWS account(s) used for dev/preview/prod.
- [ ] Select and record the primary AWS Region.
- [ ] Confirm billing access and available AWS credits.
- [ ] Enable MFA for privileged human access.
- [ ] Avoid long-lived IAM user access keys for workloads.

### ECR

- [ ] Create Image, Video, and Web private ECR repositories for the environment being configured.
- [ ] Enable scanning.
- [ ] Configure lifecycle policy.
- [ ] Apply standard tags.

### IAM

- [ ] Create `prompt-studio-<env>-ecs-task-execution`.
- [ ] Attach `AmazonECSTaskExecutionRolePolicy`.
- [ ] Create `prompt-studio-<env>-generation-worker`.
- [ ] Verify both roles trust ECS tasks only.
- [ ] Add environment-scoped Secrets Manager read permission to the execution role when secret ARNs exist.
- [ ] Do not add SQS permissions until #830 supplies queue ARNs.

### Secrets Manager

- [ ] Create environment-specific secret groups.
- [ ] Add required values directly in AWS, never in Git.
- [ ] Verify cross-environment reads are not permitted.
- [ ] Record secret ARNs in the deployment configuration without recording values.

### Cost controls

- [ ] Activate cost-allocation tags.
- [ ] Create an initial AWS Budget/notification.
- [ ] Confirm CloudWatch retention policy for future worker log groups.

## Evidence to attach to issue #829

Attach sanitized evidence only:

- selected Region;
- ECR repository names/ARNs;
- IAM role names/ARNs and attached policy names;
- Secrets Manager secret names/ARNs (never values);
- budget name/threshold, without billing-sensitive data;
- confirmation that no production secrets were committed.

## Exit criteria

Issue #829 is complete when the AWS resources above exist and the sanitized evidence is recorded in the issue. Repository documentation alone does not prove cloud resources were provisioned.

The next task is #830: create the SQS queue/DLQ topology and resource-scoped producer/consumer IAM permissions.
