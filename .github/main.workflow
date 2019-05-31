workflow "New workflow" {
  on = "schedule(*/5 * * * *)"
  resolves = ["Version"]
}

action "Check for go-ipfs release" {
  uses = "./action-publish"
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

action "Version" {
  needs = "Test"
  uses = "actions/npm@master"
  args = "version $LATEST"
}
