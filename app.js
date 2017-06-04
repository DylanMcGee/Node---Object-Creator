//This program is created to make it so I can copy paste attack data from https://pokemondb.net/pokedex/squirtle/moves/3 and automatically turn it into a valid javascript object.  Saves ~10 hours of data entry and I learned a lot too!

var fs = require('fs');
var os = require('os');


function txtfilter(filename){
	if(filename[filename.length-4] == "." && filename[filename.length-3] == "t" && filename[filename.length-2] == "x" && filename[filename.length-1] == "t"){
		return true;
	}
}

function firstLetterUppercase(word){
	var wordArray = [];
	for(var i= 1; i<word.length; i++){
		wordArray[i] = word[i].toLowerCase();
	}
	wordArray[0] = word[0].toUpperCase();
	return wordArray.join("");
}


//Create list of files in the directory.  Then filter out any that are not .txt files.
const fileList = fs.readdirSync(__dirname).filter(txtfilter);

console.log(fileList);
console.log("********************");

if(!fs.existsSync("output")){
	fs.mkdirSync("output");
}

fileList.forEach(function(x){
	var data = fs.readFileSync(x, 'utf8');
	console.log(x);

	var arrayLine_Word = []; //Array[x][y] where x is line and y is word from input file
	
	//console.log(data);
	data = data.replace(/[\r]/g, "");
	var lineBreakArray = data.split("\n")
	//console.log(lineBreakArray);
	/*##  This breaks our input into an array[x][y].  x is the line index, y is the word index.  e.g.: 3rd word on 1st line is array[0][2]##*/
	for(var i=0; i<lineBreakArray.length; i++){
		var lineSplit = lineBreakArray[i].split("\t");
		arrayLine_Word[i] = lineSplit; 
	}
	//console.log(arrayLine_Word);
	/*## We go through each line and make the following changes.
	0) If length is 6, remove first piece of data
	1) (DONE) If line is only length 1, just change it to include tm. Any TM data is already stored in an array in master program.  ie: "1" to "tm[1]"  
	2) (DONE) Remove index array[x][2], we do not need this data (physical/special)  
	3) (DONE) If accurancy array[x][3] is not 100, we need to add an accuracy indicator to move name  e.g. "Mega Punch" to "Mega Punch (85%)".  If 100% accurate do not change name.  Then remove percent field
	4) (DONE) Transform array[x][1] to be lowercase except first letter e.g. "NORMAL" to "Normal".  Our input is in all caps, o.k. to assume this for all inputs
	5) (DONE) Change array[x][2] to an integer
	 
	 ##*/
	for(var i=0; i<arrayLine_Word.length; i++){
		if(arrayLine_Word[i].length == 1){
			arrayLine_Word[i][0] = "tm[" + arrayLine_Word[i][0] + "]";
		}else{
			if(arrayLine_Word[i].length == 6){
				arrayLine_Word[i].splice(0,1);
			}
			arrayLine_Word[i].splice(2,1);
			if(arrayLine_Word[i][3] != '100'){
				arrayLine_Word[i][0] = arrayLine_Word[i][0] + " (" + arrayLine_Word[i][3] + "%)";  //"Mega Punch" to "Mega Punch (85%)"
			}
			arrayLine_Word[i].splice(3,1);
			arrayLine_Word[i][1] = firstLetterUppercase(arrayLine_Word[i][1]);
			arrayLine_Word[i][2] = parseInt(arrayLine_Word[i][2]);
		}
	}
	//console.log(arrayLine_Word);

	/*## Now we have all the data we need in our array.  Now need to join the data into a string & then output to a file
	##*/


	var attackList = "attackList : [";

	
	for(var i = 0; i<arrayLine_Word.length; i++){
		var newAttackString = "";
		if(arrayLine_Word[i].length == 3){
			newAttackString = "{name : " + arrayLine_Word[i][0] + " , type : " + arrayLine_Word[i][1] + " , power : " + arrayLine_Word[i][2] + " }, " + os.EOL;
			attackList += newAttackString;
		}
		if(arrayLine_Word[i].length ==1){
			if(i<arrayLine_Word.length -1){
				newAttackString = arrayLine_Word[i][0] + " ,";
			}else{
				newAttackString = arrayLine_Word[i][0];
			}
			attackList += newAttackString;
		}
	}
	attackList += " ]"
	console.log(attackList);


	fs.writeFileSync( __dirname + '/output/' + x + '.txt' , attackList);


});
