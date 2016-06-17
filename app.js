var express 			= require('express');
var sys 				= require('sys');
var exec 				= require('child_process').exec;
var fs 					= require('fs');
var app 				= express();
var gi_issue_root_dir 	= '.issues/issues';

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
	 
	return {id:issueId,
			header:header,
			description : description,
			tags : tags
	};

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

