import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

const mockGetOctokit = jest.fn()
const mockGetWorkflowRun = jest.fn<() => Promise<unknown>>()
const mockListJobsForWorkflowRunAttempt = jest.fn<() => Promise<unknown>>()

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => ({
  getOctokit: mockGetOctokit
}))

const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    core.getInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        repository: 'owner/repo',
        server_url: 'https://github.com',
        workflow: 'CI',
        run_id: '12345',
        run_attempt: '1',
        job: 'build',
        github_token: 'test-token'
      }
      return inputs[name] || ''
    })

    const mockOctokit = {
      rest: {
        actions: {
          getWorkflowRun: mockGetWorkflowRun,
          listJobsForWorkflowRunAttempt: mockListJobsForWorkflowRunAttempt
        }
      }
    }

    mockGetOctokit.mockReturnValue(mockOctokit)

    mockGetWorkflowRun.mockResolvedValue({
      data: {
        name: 'CI Workflow',
        path: '.github/workflows/ci.yml',
        run_number: 42
      }
    })

    mockListJobsForWorkflowRunAttempt.mockResolvedValue({
      data: {
        jobs: [
          {
            id: 54321,
            name: 'build',
            status: 'completed',
            conclusion: 'success',
            started_at: '2024-01-01T00:00:00Z',
            completed_at: '2024-01-01T00:05:00Z',
            head_sha: 'abc123'
          }
        ]
      }
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('retrieves job information and sets outputs', async () => {
    await run()

    expect(core.setOutput).toHaveBeenCalledWith(
      'run_url',
      'https://github.com/owner/repo/actions/runs/12345'
    )
    expect(core.setOutput).toHaveBeenCalledWith('job_id', '54321')
    expect(core.setOutput).toHaveBeenCalledWith('job_name', 'build')
    expect(core.setOutput).toHaveBeenCalledWith(
      'job_url',
      'https://github.com/owner/repo/actions/runs/12345/job/54321'
    )
    expect(core.setOutput).toHaveBeenCalledWith(
      'job_summary_url',
      'https://github.com/owner/repo/actions/runs/12345/job/54321?pr=12345'
    )
    expect(core.setOutput).toHaveBeenCalledWith('job_status', 'completed')
    expect(core.setOutput).toHaveBeenCalledWith('job_conclusion', 'success')
    expect(core.setOutput).toHaveBeenCalledWith('workflow_name', 'CI Workflow')
    expect(core.setOutput).toHaveBeenCalledWith('run_number', '42')
  })

  it('handles job not found error', async () => {
    mockListJobsForWorkflowRunAttempt.mockResolvedValue({
      data: {
        jobs: []
      }
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'Job "build" not found in workflow run 12345'
    )
  })

  it('handles API errors gracefully', async () => {
    mockGetWorkflowRun.mockRejectedValue(new Error('API Error'))

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('API Error')
  })
})
