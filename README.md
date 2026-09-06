# Pull Requests GitHub View

WebWorker for the pull requests github view functionality in Lvce Editor.

## Contributing

```sh
git clone git@github.com:lvce-editor/pull-requests-github-view.git &&
cd pull-requests-github-view &&
npm ci &&
npm test
```

## Create a pull request

Open the Pull Requests view and select **Create Pull Request**, or run **GitHub Pull Requests: Create Pull Request**. The Git extension supplies the checked-out branch, latest commit subject, and push remote. The base defaults to the remote's default branch; edit either branch and the title as needed. The description is optional.

Sign in to LVCE with GitHub, publish the merge branch, then select **Create + Auto-Squash**. The backend uses the account's stored GitHub connection; GitHub tokens stay on the backend. GitHub login requests `repo` access. Existing connections without repository access need to sign in with GitHub again.

Creation and enabling squash auto-merge are separate requests. If auto-merge fails because of repository settings, permissions, or checks, the created PR remains linked in the form. **Retry Auto-Squash** retries that operation only. Network failures during creation ask you to check GitHub before retrying because the request may already have succeeded.

This flow requires a Git extension with `git.getPullRequestDefaults` and the backend's `/github/pull-requests` endpoints. It does not push commits. GitHub's [auto-merge requirements](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/automatically-merging-a-pull-request) apply.
