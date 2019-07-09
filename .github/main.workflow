workflow "New workflow" {
  on = "schedule(0 */1 * * *)"
  resolves = ["Version and publish"]
}

action "Check for go-ipfs release" {
  uses = "./action-check-for-go-ipfs-release"
}

action "Build" {
  needs = "Check for go-ipfs release"
  uses = "actions/npm@master"
  args = "install"
}

action "Test" {
  needs = "Build"
  uses = "actions/npm@master"
  args = "test"
}

action "Version and publish" {
  needs = "Test"
  uses = "./action-publish"
  secrets = ["GITHUB_TOKEN", "NPM_AUTH_TOKEN"]
}
