workflow "New workflow" {
  on = "schedule(*/3 * * * *)"
  resolves = ["Version"]
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

action "Version" {
  needs = "Test"
  uses = "actions/npm@master"
  runs = "sh -c \"echo $LATEST && npm version $LATEST\""
}
