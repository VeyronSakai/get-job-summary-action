# Get Job Summary Action

[![GitHub Super-Linter](https://github.com/VeyronSakai/get-job-summary-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/VeyronSakai/get-job-summary-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/VeyronSakai/get-job-summary-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/VeyronSakai/get-job-summary-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/VeyronSakai/get-job-summary-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/VeyronSakai/get-job-summary-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)
[![Licensed](https://github.com/VeyronSakai/get-job-summary-action/actions/workflows/licensed.yml/badge.svg)](https://github.com/VeyronSakai/get-job-summary-action/actions/workflows/licensed.yml)

A TypeScript-based GitHub Action to retrieve job summary URLs and comprehensive
job information from GitHub Actions workflows. This action provides easy access
to job logs, summaries, and metadata that are not typically available in the
default workflow context.

## Features

- 🔗 **Job Summary URL**: Direct link to job summary and logs
- 📊 **Comprehensive Job Information**: Status, conclusion, timing, and more
- 🏗️ **Workflow Metadata**: Workflow name, path, and run number

## Quick Start

```yaml
- name: Get Job Summary
  uses: VeyronSakai/get-job-summary-action@v0.1
  id: job-info
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}

- name: Display Job Summary URL
  env:
    JOB_SUMMARY_URL: ${{ steps.job-info.outputs.job_summary_url }}
  shell: pwsh
  run: Write-Output "Job Summary: $env:JOB_SUMMARY_URL"
```

## Inputs

| Input                        | Description                                                              | Required | Default                     |
| ---------------------------- | ------------------------------------------------------------------------ | -------- | --------------------------- |
| `repository`                 | The owner and repository name (e.g., owner/repository)                   | No       | `${{ github.repository }}`  |
| `server_url`                 | The URL of the GitHub server                                             | No       | `${{ github.server_url }}`  |
| `workflow`                   | The name or ID of the workflow                                           | No       | `${{ github.workflow }}`    |
| `run_id`                     | The ID of the workflow run                                               | No       | `${{ github.run_id }}`      |
| `run_attempt`                | The attempt number of the workflow run                                   | No       | `${{ github.run_attempt }}` |
| `job`                        | The job name                                                             | No       | `${{ github.job }}`         |
| `github_token`               | GitHub token for API access                                              | No       | `${{ github.token }}`       |
| `include_job_summary_anchor` | Include anchor to specific job in job_summary_url (e.g., #summary-12345) | No       | `false`                     |

## Outputs

| Output                | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `run_url`             | The URL of the workflow run                                   |
| `job_id`              | The ID of the job                                             |
| `job_name`            | The name of the job                                           |
| `job_url`             | The URL of the job                                            |
| `job_summary_url`     | The URL of the workflow run summary page                      |
| `job_summary_raw_url` | The raw URL of the job logs                                   |
| `job_status`          | The status of the job (queued, in_progress, completed)        |
| `job_conclusion`      | The conclusion of the job (success, failure, cancelled, etc.) |
| `job_started_at`      | When the job started (ISO 8601 format)                        |
| `job_completed_at`    | When the job completed (ISO 8601 format)                      |
| `workflow_name`       | The name of the workflow                                      |
| `workflow_path`       | The path of the workflow file                                 |
| `run_number`          | The run number of the workflow                                |

## Use Cases

### 1. Comment on Pull Request with Job Summary

```yaml
name: Build and Test
on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run tests
        run: npm test

      - name: Get Job Summary
        uses: VeyronSakai/get-job-summary-action@v0.1
        id: job-info

      - name: Comment PR with Job Summary
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `✅ Build completed! [View job summary](${{ steps.job-info.outputs.job_summary_url }})`
            })
```

### 2. Send Slack Notification with Job Details

```yaml
- name: Get Job Summary
  uses: VeyronSakai/get-job-summary-action@v0.1
  id: job-info

- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Workflow completed",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*${{ steps.job-info.outputs.workflow_name }}* #${{ steps.job-info.outputs.run_number }}\nStatus: ${{ steps.job-info.outputs.job_status }}\n<${{ steps.job-info.outputs.job_summary_url }}|View Summary>"
            }
          }
        ]
      }
```

### 3. Create Issue on Failure with Job Link

```yaml
- name: Get Job Summary
  if: failure()
  uses: VeyronSakai/get-job-summary-action@v0.1
  id: job-info

- name: Create Issue
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: `Build failed: ${context.workflow} #${context.runNumber}`,
        body: `The workflow failed. [View job logs](${{ steps.job-info.outputs.job_url }})`
      })
```

### 4. Direct Link to Specific Job Summary

```yaml
- name: Get Job Summary with Anchor
  uses: VeyronSakai/get-job-summary-action@v0.1
  id: job-info
  with:
    include_job_summary_anchor: true

- name: Post Comment with Direct Link
  uses: actions/github-script@v7
  with:
    script: |
      // This will link directly to the specific job within the workflow run
      // Example: https://github.com/owner/repo/actions/runs/12345#summary-67890
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `📊 [View job summary directly](${{ steps.job-info.outputs.job_summary_url }})`
      })
```

## Development

### Prerequisites

- Node.js 20.x or later
- npm or Yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/VeyronSakai/get-job-summary-action.git
cd get-job-summary-action

# Install dependencies
npm install

# Run tests
npm test

# Build the action
npm run bundle
```

### Testing Locally

You can test the action locally using the `@github/local-action` tool:

```bash
npm run local-action
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## Acknowledgments

- Inspired by
  [ipdxco/job-summary-url-action](https://github.com/ipdxco/job-summary-url-action)
- Built with [GitHub Actions Toolkit](https://github.com/actions/toolkit)
- TypeScript template from
  [actions/typescript-action](https://github.com/actions/typescript-action)
