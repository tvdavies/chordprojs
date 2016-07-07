var q = require("q"),
    github = require("octonode");

// TODO: Make this work recursively
function getFilesInRepo(owner, repo, callback) {
    var client = github.client();
    var repoPath = "/repos/" + owner + "/" + repo;

    client.get(repoPath  + "/commits/master", {}, (err, status, body, headers) => {
        if (err) {
            callback(err);
            return;
        }

        client.get(repoPath + "/git/trees/" + body.commit.tree.sha, (err, status, body, headers) => {
            if (err) {
                callback(err);
                return;
            }

            callback(null, body.tree.filter(item => item.type === "blob").map(file => file.path));
        });
    });
}

module.exports = {
    getFilesInRepo: getFilesInRepo
};