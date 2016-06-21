var express 			= require('express');
var sys 				= require('sys');
var exec 				= require('child_process').exec;
var execSync			= require('child_process').execSync;
var fs 					= require('fs');
var app 				= express();
var gi_issue_git_dir 	= '.issues';
var gi_issue_root_dir 	=  gi_issue_git_dir + '/issues';

app.get('/', function (req, res) {
	
	 
		res.send(gi_list());
	 
	
});

function gi_list() {
	var issues = [];
	 var issuesDir = getDirectoryContents(gi_issue_root_dir);
	 for (var i=0; i < issuesDir.length; i++) {
	 	var issueDir = getDirectoryContents(gi_issue_root_dir+'/'+ issuesDir[i]);
	 	var issueId = issuesDir[i]+issueDir[0];

	 	 issues.push(constructIssue(issueId, gi_issue_root_dir+'/'+issuesDir[i]+'/'+issueDir[0]));
	 }
	 return issues;
}

function constructIssue(issueId, directory) {
	var headerAndDescription = fs.readFileSync(directory+'/description').toString().split("\n");
	var header = headerAndDescription[0];
	var description ='';

	for (var i =1; i< headerAndDescription.length; i++) {
		description += headerAndDescription[i] ;
		if (i<headerAndDescription.length-1) {
			description += '\n'
		}
	}

	var tags = fs.readFileSync(directory+'/tags').toString().split("\n");
	tags.splice(tags.length-1, 1);
	var comments = retrieveComments(issueId, directory);

	return {id:issueId,
			header:header,
			description : description,
			tags : tags,
			comments: comments
	};

}

function retrieveComments(issueId, directory) {
	 
	var commentsRoot = execSync("cd " + gi_issue_git_dir + " && git log --reverse --grep='^gi comment mark "+issueId+"' --format='%H'").toString().split("\n");
	var comments = [];
	console.log(commentsRoot);
	try {
	 
	 	for (var i =0; i < commentsRoot.length; i++) {
	 		console.log("Retrieving for " + commentsRoot[i]);
	 		var metadata =  execSync("cd " + gi_issue_git_dir + " && git show --no-patch --format='auth:[authStart[%an <%ae>]authEnd] date:[dateStart[%aD]dateEnd]' " + commentsRoot[i]).toString();
	 		var author =	metadata.substring(metadata.indexOf("[authStart[") + 11, metadata.indexOf("]authEnd]") );
	 		var date =      metadata.substring(metadata.indexOf("[dateStart[") + 11, metadata.indexOf("]dateEnd]") );

	 		var cm = fs.readFileSync(directory+'/comments/'+commentsRoot[i]).toString();
	 		comments.push({
	 			description:cm,
	 		 	author: author,
	 			date: date
	 		});
	 	}
	 	 
	 } catch (e) {

	 }
	 return comments;
}


app.get('/issues/', function (req, res) {
	
	console.log(req.query["id"] );
	gi_list(function(issues) {
		res.send(issues);
	});
	
});

function getDirectoryContents(dir) {
	return fs.readdirSync(dir);
}

function gi_issue(issueId, callback) {
	exec("gi list", function(error, stdout, stderr) {
		
		if (stdout.length >0) {
			var issuesRaw = stdout.split("\n");
			var issues = [];
			for (var i =0; i<issuesRaw.length-1; i++) {
				issues.push(deserializeIssue(issuesRaw[i]));
			}

			callback(issues);
			
		}
	});
}



function deserializeIssue(raw) {
	var id =	raw.split(" ")[0];
	var descr = raw.substring(raw.indexOf(" ")+1);
	return {id:id, header:descr};

}

app.listen(3000, function () {
  console.log('Listening on port 3000!');
});

