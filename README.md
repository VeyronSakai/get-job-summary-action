# Get Job Summary GitHub Action

A TypeScript-based GitHub Action to retrieve job summary URLs and comprehensive
job information from GitHub Actions workflows.

## Features

This action provides comprehensive information about GitHub Actions jobs,
including:

- Job Summary URL for easy access to job logs and summaries
- Job metadata (status, conclusion, timing)
- Workflow information
- Extensible design for future enhancements

## Usage

### Basic Usage

```yaml
- name: Get Job Summary
  uses: your-username/get-job-summary@v1
  id: job-info
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}

- name: Display Job Summary URL
  run: echo "Job Summary URL: ${{ steps.job-info.outputs.job_summary_url }}"
```

### Advanced Usage with Custom Parameters

```yaml
- name: Get Job Summary for Specific Job
  uses: your-username/get-job-summary@v1
  id: job-info
  with:
    repository: ${{ github.repository }}
    run_id: ${{ github.run_id }}
    job: 'build'
    github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Get Job Summary URL with Anchor

```yaml
- name: Get Job Summary with Direct Link to Job
  uses: your-username/get-job-summary@v1
  id: job-info
  with:
    include_job_summary_anchor: true
    github_token: ${{ secrets.GITHUB_TOKEN }}

- name: Display Job Summary URL with Anchor
  run: |
    # This will output: https://github.com/owner/repo/actions/runs/12345#summary-67890
    echo "Direct link to job summary: ${{ steps.job-info.outputs.job_summary_url }}"
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

| Output                | Description                              |
| --------------------- | ---------------------------------------- |
| `run_url`             | The URL of the workflow run              |
| `job_id`              | The ID of the job                        |
| `job_name`            | The name of the job                      |
| `job_url`             | The URL of the job                       |
| `job_summary_url`     | The URL of the workflow run summary page |
| `job_summary_raw_url` | The raw URL of the job logs              |
| `job_status`          | The status of the job                    |
| `job_conclusion`      | The conclusion of the job                |
| `job_started_at`      | When the job started                     |
| `job_completed_at`    | When the job completed                   |
| `workflow_name`       | The name of the workflow                 |
| `workflow_path`       | The path of the workflow file            |
| `run_number`          | The run number of the workflow           |

## Example Workflow

```yaml
name: Build and Test
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run tests
        run: npm test

      - name: Get Job Summary
        uses: your-username/get-job-summary@v1
        id: job-info

      - name: Comment PR with Job Summary
        if: github.event_name == 'pull_request'
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

## Development

### Prerequisites

- Node.js 20.x or later
- npm or Yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/get-job-summary.git
cd get-job-summary

# Install dependencies
npm install

# Run tests
npm test

# Build the action
npm run package
```

### Testing Locally

You can test the action locally using the `@github/local-action` tool:

```bash
npm run local-action
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.
