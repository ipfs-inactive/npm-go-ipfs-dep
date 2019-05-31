workflow "New workflow" {
  on = "schedule(*/5 * * * *)"
  resolves = ["Update and publish"]
}

action "Update and publish" {
  uses = "./action-publish"
  secrets = ["GITHUB_TOKEN", "NPM_AUTH_TOKEN"]
}
