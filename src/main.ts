import * as core from '@actions/core'
import * as github from '@actions/github'

interface JobInfo {
  runUrl: string
  jobId: number
  jobName: string
  jobUrl: string
  jobSummaryUrl: string
  jobSummaryRawUrl: string
  jobStatus: string
  jobConclusion: string | null
  jobStartedAt: string | null
  jobCompletedAt: string | null
  workflowName: string
  workflowPath: string
  runNumber: number
}

export async function run(): Promise<void> {
  try {
    const repository = core.getInput('repository')
    const serverUrl = core.getInput('server_url')
    const workflow = core.getInput('workflow')
    const runId = parseInt(core.getInput('run_id'), 10)
    const runAttempt = parseInt(core.getInput('run_attempt'), 10)
    const jobName = core.getInput('job')
    const token = core.getInput('github_token')
    const includeJobSummaryAnchor = core.getBooleanInput(
      'include_job_summary_anchor'
    )

    const [owner, repo] = repository.split('/')

    const octokit = github.getOctokit(token)

    core.debug(
      `Getting job info for ${owner}/${repo} run ${runId} job ${jobName}`
    )

    const { data: workflowRun } = await octokit.rest.actions.getWorkflowRun({
      owner,
      repo,
      run_id: runId
    })

    const { data: jobs } =
      await octokit.rest.actions.listJobsForWorkflowRunAttempt({
        owner,
        repo,
        run_id: runId,
        attempt_number: runAttempt
      })

    const job = jobs.jobs.find((j) => j.name === jobName)

    if (!job) {
      throw new Error(`Job "${jobName}" not found in workflow run ${runId}`)
    }

    const runUrl = `${serverUrl}/${owner}/${repo}/actions/runs/${runId}`
    const jobUrl = `${runUrl}/job/${job.id}`
    const jobSummaryUrl = includeJobSummaryAnchor
      ? `${runUrl}#summary-${job.id}`
      : runUrl
    const jobSummaryRawUrl = `${serverUrl}/${owner}/${repo}/commit/${job.head_sha}/checks/${job.id}/logs`

    const jobInfo: JobInfo = {
      runUrl,
      jobId: job.id,
      jobName: job.name,
      jobUrl,
      jobSummaryUrl,
      jobSummaryRawUrl,
      jobStatus: job.status,
      jobConclusion: job.conclusion,
      jobStartedAt: job.started_at,
      jobCompletedAt: job.completed_at,
      workflowName: workflowRun.name || workflow,
      workflowPath: workflowRun.path || '',
      runNumber: workflowRun.run_number
    }

    core.setOutput('run_url', jobInfo.runUrl)
    core.setOutput('job_id', jobInfo.jobId.toString())
    core.setOutput('job_name', jobInfo.jobName)
    core.setOutput('job_url', jobInfo.jobUrl)
    core.setOutput('job_summary_url', jobInfo.jobSummaryUrl)
    core.setOutput('job_summary_raw_url', jobInfo.jobSummaryRawUrl)
    core.setOutput('job_status', jobInfo.jobStatus)
    core.setOutput('job_conclusion', jobInfo.jobConclusion || '')
    core.setOutput('job_started_at', jobInfo.jobStartedAt || '')
    core.setOutput('job_completed_at', jobInfo.jobCompletedAt || '')
    core.setOutput('workflow_name', jobInfo.workflowName)
    core.setOutput('workflow_path', jobInfo.workflowPath)
    core.setOutput('run_number', jobInfo.runNumber.toString())

    core.info(`Job Summary URL: ${jobInfo.jobSummaryUrl}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
