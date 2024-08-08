var hasTouchStartEvent = 'ontouchstart' in document.createElement( 'div' );

CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r) {
if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}

var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

if(h < w*1.4)
{
	var f = w*1.4/h;
	w /= f;
}

var canvas = document.getElementById("gameCanvas");
canvas.width = w*2;
canvas.height =h*2;

canvas.style.width = w+"px";
canvas.style.height = h+"px";
canvas.getContext('2d').scale(2,2);

var PADDING = 5;
var WIDTH = 0.5*canvas.width-PADDING;
var HEIGHT =0.5*canvas.height-PADDING;
var HEIGHTWIDTH = Math.min(WIDTH,HEIGHT);

var DPR = window.devicePixelRatio;

var GRIDSIZE = HEIGHTWIDTH-PADDING*9;
var CELLSIZE = GRIDSIZE/7;

var MOUSEX = (WIDTH-PADDING)/2;
MOUSEX = (3+0.5)*(0.5*canvas.width/7);

var ANIMBRICKS = [];
var SCORE = 0;

var HIGHSCORE = 0;
if(localStorage.getItem("highscore"))
	HIGHSCORE = localStorage.getItem("highscore");

var ctx = canvas.getContext("2d");


document.addEventListener('touchmove', function (event) {
   event.preventDefault(); 
}, false);

document.addEventListener('mousemove', function (event) {
   MOUSEX = event.layerX;
}, false);

document.addEventListener('click', function (event) {
   
}, false);

window.addEventListener('resize', function (event) {
	w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

	if(h < w*1.4)
	{
		var f = w*1.4/h;
		w /= f;
	}

	canvas.width = w*2;
	canvas.height =h*2;

	canvas.style.width = w+"px";
	canvas.style.height = h+"px";
	canvas.getContext('2d').scale(2,2);
	WIDTH  = 0.5*canvas.width-PADDING;
	HEIGHT = 0.5*canvas.height-PADDING;
	HEIGHTWIDTH = Math.min(WIDTH,HEIGHT);
	GRIDSIZE = HEIGHTWIDTH-PADDING*9;
	CELLSIZE = GRIDSIZE/7;

}, false);


var bricks = [49];
var grid = [];
var currentBrick = 5;
var letters = "ABCDEFGHIJKLMNOPQRSTUVXYZÅÄÖ";
var lettersLower = "abcdefghijklmnopqrstuvxyzåäö";

var letterValues = [1,4,8,1,1,4,2,3,1,8,3,1,3,1,2,3,10,1,1,1,3,4,10,8,10,4,4,4];

var letterProbabilities= [9,2,2,7,8,2,4,3,6,1,3,7,3,7,5,3,0,9,8,7,3,2,1,2,1,2,2,2];
var lettersOccurances   =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var lettersMaxOccurances=[5,2,2,5,6,2,3,3,5,2,3,5,3,5,5,3,0,5,5,5,4,2,2,2,2,3,3,3];

var totalLetters = letterProbabilities.reduce(function(a, b) { return a + b; }, 0);

function getRandomBrick() //0->28 with probability
{
	var weights = [];
	for(var i = 0;i<letters.length;i++)
		weights[i] = letterProbabilities[i]/totalLetters;

	var num = Math.random(),
        s = 0,
        lastIndex = weights.length - 1;

    for (var i = 0; i < lastIndex; ++i) {
        s += weights[i];
        if (num < s) {
            return i;
        }
    }

    return lastIndex;
}

for(var i = 0;i<7;i++)
	grid[i] = [];

var HORIZONTALWORDS = [];
var VERTICALWORDS = [];

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function init()
{
	grid = [];

	for(var i = 0;i<7;i++)
		grid[i] = [];

	for(var i = 0;i<49;i++)
	{
		var randLetter = getRandomBrick();
		var tries = 0;
		while(lettersOccurances[randLetter] >= lettersMaxOccurances[randLetter]-1)
		{
			randLetter = getRandomBrick();
			tries++;
		}
		lettersOccurances[randLetter]++;
		bricks[i] = randLetter;
	}

	bricks = shuffle(bricks);

	for(var i = 1;i<6;i++)
		grid[i][6] = bricks[i-1];

	SCORE = 0;
	currentBrick = 5;

	HORIZONTALWORDS = [];
	VERTICALWORDS = [];

	MOUSEX = (3+0.5)*(0.5*canvas.width/7);

	lettersOccurances   =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
}
init();

function scoreWord(word,isHorizontal)
{
	var isNewWord = false;
	if(isHorizontal)
	{
		var newWord = {
			word:word.word,
			startx:word.startx,
			starty:word.starty,
			timeOut: 1
		};
		if(HORIZONTALWORDS.findIndex(i => i.word == word.word && i.startx == word.startx) == -1)
		{
			isNewWord = true;
			HORIZONTALWORDS.push(newWord);
		}
	}
	else
	{
		var newWord = {
			word:word.word,
			startx:word.startx,
			starty:word.starty,
			timeOut: 1
		};
		if(VERTICALWORDS.findIndex(i => i.word == word.word && i.startx == word.startx) == -1)
		{
			isNewWord = true;
			VERTICALWORDS.push(newWord);
		}
	}

	if(isNewWord)
	{
		var points = 0;
		for(var i = 0;i<word.word.length;i++)
		{
			points+= letterValues[lettersLower.indexOf(word.word[i])];
		}
		points*=word.word.length;

		SCORE += points;
	}
	
	if(currentBrick == 49 && SCORE > HIGHSCORE)
	{
		HIGHSCORE = SCORE;
		localStorage.setItem("highscore", SCORE);
	}

}

function tryWord(word,startx,starty,isHorizontal)
{
	if(word.length > 1)
	{
		var wordId = wordlist.indexOf(word.toLowerCase());
		if(wordId != -1) //valid word
		{
			scoreWord({
				word:word.toLowerCase(),
				startx:startx,
				starty:starty
			},isHorizontal);
		}
	}
}

function wordExist(word)
{
	if(wordlist.indexOf(word.toLowerCase()) > -1) return true;
	return false;
}

function updateWordsAndScore()
{
	var word = "";
	var startx =-1;
	var starty =-1;

	//Check horizontal words
	for(var y = 0;y<7;y++)
	{
		for(var i = 0;i<7;i++)
		{
			word = "";
			startx =-1;
			starty =-1;
			for(var x = i;x<7;x++)
			{	
				if(grid[x][y] > -1)
				{
					if(word == "") //startpos
					{
						startx = x;
						starty = y;
					}
					word += letters[grid[x][y]];
					tryWord(word,startx,starty,true);
					
				}
				else
				{
					break;
				}
			}
		}
	}

	//Check vertical words
	for(var x = 0;x<7;x++)
	{
		for(var i = 0;i<7;i++)
		{
			word = "";
			startx =-1;
			starty =-1;
			for(var y = i;y<7;y++)
			{	
				if(grid[x][y] > -1)
				{
					if(word == "") //startpos
					{
						startx = x;
						starty = y;
					}
					word += letters[grid[x][y]];
					tryWord(word,startx,starty,false);
				}
				else
				{
					break;
				}
			}
		}
	}
}


function drawBackground()
{
	var gridSize = HEIGHTWIDTH-PADDING*9;
	var cellSize = gridSize/7;
	ctx.fillStyle="#AAA";
	ctx.roundRect(PADDING,HEIGHT-HEIGHTWIDTH+PADDING,
				HEIGHTWIDTH-PADDING,
				HEIGHTWIDTH-PADDING,6);
    ctx.fill();

	ctx.fillStyle="#CCC";
	for(var i = 0;i<7;i++) //Horizontal
	{
		for(var j = 0;j<7;j++) //Horizontal
		{
			ctx.beginPath();
			ctx.roundRect(2*PADDING+i*(PADDING+cellSize),
						HEIGHT-HEIGHTWIDTH+2*PADDING+j*(PADDING+cellSize),
						cellSize,cellSize,6);
   	 		ctx.fill();
	   	}
	}
}



function drawBricks()
{
	var gridSize = HEIGHTWIDTH-PADDING*9;
	var cellSize = gridSize/7;


	for(var i = 0;i<7;i++) //Horizontal
	{
		for(var j = 0;j<7;j++) //Horizontal
		{
			if(grid[i][j] > -1)
			{
				putBrick(i,j,"#e9cd4c",letters[grid[i][j]]);
/*
				ctx.fillStyle="#e9cd4c";
				ctx.beginPath();
				ctx.roundRect(2*PADDING+i*(PADDING+cellSize),
							HEIGHT-HEIGHTWIDTH+2*PADDING+j*(PADDING+cellSize),
							cellSize,cellSize,4);
		   	 	ctx.fill();

				ctx.closePath();
				ctx.fill();
				ctx.fillStyle = "#000";
				var fontSize = Math.floor(HEIGHTWIDTH/11);
				ctx.font=""+fontSize+"px Verdana";
				ctx.textBaseline = "Middle";
				ctx.textAlign="center";
				ctx.fillText(letters[grid[i][j]], 
							0.045*HEIGHTWIDTH+PADDING+i*(PADDING+cellSize) ,
							HEIGHT-HEIGHTWIDTH+PADDING+0.04*HEIGHTWIDTH+(j+0.5)*(PADDING+cellSize));*/
	   	 	}
	   	}
	}
}

function drawTempBrick()
{

		ctx.fillStyle = "#000";
		var fontSize = 14;
		ctx.font=""+fontSize+"px Verdana";
		ctx.textBaseline = "Middle";
		ctx.textAlign="left";
		ctx.fillText("Nästa",PADDING,HEIGHT-9*CELLSIZE-4*PADDING-8);
		ctx.fillText("Bokstav",PADDING,HEIGHT-9*CELLSIZE-4*PADDING+8);

	if(currentBrick < 49)
	{


		var xPos = 7*MOUSEX/(0.5*canvas.width)-0.5;
		//Next gray brick
		if(currentBrick < 48)
		{
			putBrick(1,-2,"#999",letters[bricks[currentBrick+1]],-1);
		}

		putBrick(xPos,-1,"#e9cd4c",letters[bricks[currentBrick]],-1);
	}
}

function putBrick(x,y,color,letter,extraPadding)
{
	extraPadding = extraPadding !== undefined ? extraPadding : 0;
	color = color !== undefined ? color : "#e9cd4c";

	var pad = (2+x)*PADDING;
	ctx.fillStyle=color;
	ctx.beginPath();
	ctx.roundRect(2*PADDING+x*(PADDING+CELLSIZE),
				  HEIGHT-HEIGHTWIDTH+2*PADDING+y*(PADDING+CELLSIZE)+extraPadding*PADDING,
				  CELLSIZE,CELLSIZE,6);
	ctx.fill();
	ctx.fillStyle = "#000";
	var fontSize = 0.75*CELLSIZE;
	ctx.font=""+fontSize+"px Verdana";
	ctx.textBaseline = "Middle";
	ctx.textAlign="center";
	var offsetY = HEIGHT-HEIGHTWIDTH+1*PADDING;
	ctx.fillText(letter, (x+0.5)*(CELLSIZE)+pad,offsetY+(y+0.83)*(CELLSIZE+PADDING)+extraPadding*PADDING);
}

function putHider(x,y)
{
	ctx.fillStyle="#CCC";
	ctx.beginPath();
	ctx.roundRect(2*PADDING+x*(PADDING+CELLSIZE),
				  HEIGHT-HEIGHTWIDTH+2*PADDING+y*(PADDING+CELLSIZE),
				  CELLSIZE,CELLSIZE,6);
 	ctx.fill();
}

function landBrick(x)
{

	var floatPos = 7*MOUSEX/(0.5*canvas.width);
	var xPos = Math.floor(floatPos);

	floatPos-=0.5; //for bricksize offset

	if(xPos < 0) xPos = 0;
	if(xPos > 6) xPos = 6;

	for(var i = 0;i<7;i++)
	{
		if(!(grid[xPos][6-i] > -1))
		{
			grid[xPos][6-i] = bricks[currentBrick];
			ANIMBRICKS.push(
			{
				brick:letters[bricks[currentBrick]],
				startx:floatPos,
				endx:xPos,
				starty:-1,
				endy:6-i,
				time:0,
				dist: Math.sqrt((floatPos-xPos)*(floatPos-xPos) + (-1-(6-i))*(-1-(6-i)))
			});
			currentBrick++;

			updateWordsAndScore();
			break;
		}
	}
}

function drawScore()
{
	ctx.fillStyle="#AAA";
	ctx.roundRect(WIDTH-100,PADDING,100,80,6);
    ctx.fill();

    ctx.fillStyle = "#000";
	var fontSize = 26;
	ctx.font=""+fontSize+"px Verdana";
	ctx.textBaseline = "Middle";
	ctx.textAlign="center";
	ctx.fillText("Poäng",WIDTH-50,PADDING+32);
	ctx.fillText(SCORE,WIDTH-50,PADDING+64);

	//Highscore
	ctx.fillStyle="#AAA";
	ctx.roundRect(WIDTH-175-PADDING,PADDING,75,60,6);
    ctx.fill();

    ctx.fillStyle = "#000";
	var fontSize = 13;
	ctx.font=""+fontSize+"px Verdana";
	ctx.textBaseline = "Middle";
	ctx.textAlign="center";
	ctx.fillText("Högsta",WIDTH-135-PADDING,PADDING+24);
	ctx.fillText(HIGHSCORE,WIDTH-135-PADDING,PADDING+42);
}

function drawButtons()
{
	ctx.fillStyle="#CCC";
	ctx.roundRect(PADDING,PADDING,100,80,6);
    ctx.fill();

    ctx.fillStyle = "#000";
	var fontSize = 26;
	ctx.font=""+fontSize+"px Verdana";
	ctx.textBaseline = "Middle";
	ctx.fillText("Nytt",PADDING+50,PADDING+32);
	ctx.fillText("Spel",PADDING+50,PADDING+64);
}

function putRing(x,y,size,isHorizontal)
{
	ctx.beginPath();
    ctx.strokeStyle = "#F0F";
    ctx.lineWidth=0.04*CELLSIZE;
    switch(size)
    {
    	case 2:
    		ctx.strokeStyle = "#ff7540";
    		ctx.strokeStyle = "#c0a300";
    		break;
    	case 3:
    		ctx.strokeStyle = "#ff4040";
    		break;
    	case 4:
    		ctx.strokeStyle = "#7140ff";
    		break;
    	case 5:
    		ctx.strokeStyle = "#4095ff";
    		break;
    	case 6:
    		ctx.strokeStyle = "#40ff5a";
    		break;
    	case 7:
    		ctx.strokeStyle = "#d138c5";
    		break;
    }

    if(isHorizontal)
    {
    	var newX = x+size/2;
    	var newY = y+0.5;
		ctx.ellipse(2*PADDING+newX*(PADDING+CELLSIZE) - 0.5*PADDING ,
				  HEIGHT-HEIGHTWIDTH+2*PADDING+newY*(PADDING+CELLSIZE), CELLSIZE*size/2, CELLSIZE/2, 0, 0, 2 * Math.PI);
    }
    else
    {
    	var newX = x+0.5;
   		var newY = y+size/2;
		ctx.ellipse(2*PADDING+newX*(PADDING+CELLSIZE)  - 0.5*PADDING,
				  HEIGHT-HEIGHTWIDTH+2*PADDING+newY*(PADDING+CELLSIZE)- 0.5*PADDING, CELLSIZE/2, CELLSIZE*size/2, 0, 0, 2 * Math.PI);
	}
   
	ctx.stroke();
}

var CLICK = (navigator.userAgent.match(/ios|android|ipad/i) ? 'touchstart' : 'click' )

function input(event,isTouch)
{

	if(event.layerX < 100 && event.layerY < 100)
	{
		init();
	}
	else if(event.clientY > HEIGHT-WIDTH)
	{
		var oldMOUSEX = MOUSEX;
		var distance = 0;
		if(isTouch) 
		{

			distance = Math.abs(event.clientX-MOUSEX);
			MOUSEX = event.clientX;

			var floatPos = 7*MOUSEX/(0.5*canvas.width);
			var xPos = Math.floor(floatPos);
			MOUSEX = (xPos+0.5)*(0.5*canvas.width/7);
		}

		if(isTouch) 
		{
			if(oldMOUSEX == MOUSEX && ANIMBRICKS.length < 1)
				landBrick(MOUSEX*WIDTH);
		}
		else
			landBrick(event.clientX);
	}
}

document.addEventListener('click', function (event) {
   event.preventDefault();
   input(event,false);
}, false);

document.addEventListener('touchstart', function (event) {
	event.clientX = event.changedTouches[0].pageX;
	event.clientY = event.changedTouches[0].pageY;
	//alert(event.clientX);
   event.preventDefault();
   input(event,true);
}, false);


function showAnimationHiders()
{
	for(var i = 0;i<ANIMBRICKS.length;i++)
	{
		var b = ANIMBRICKS[i];
		var t = b.time;
		if(t > 1.0) t = 1.0;
		var s = (1-t);
		if(t < 1.0)
			putHider(b.endx,b.endy);

		if(ANIMBRICKS[i].time >= 1.0)
		{
			ANIMBRICKS.splice(i, 1);
			i--;
		}
	}
}


function updateAnimationBricks()
{
	for(var i = 0;i<ANIMBRICKS.length;i++)
	{
		var b = ANIMBRICKS[i];
		var t = b.time;
		if(t > 1.0) t = 1.0;
		var s = (1-t);
		if(t < 1.0)
		putBrick(b.startx*s+b.endx*t,b.starty*s+b.endy*t,"#e9cd4c",b.brick);
		ANIMBRICKS[i].time+=5*(1/(30*b.dist));
	}
}

function drawRings()
{
	
	for(var i = 0;i<HORIZONTALWORDS.length;i++)
	{
		var ring = HORIZONTALWORDS[i];
		HORIZONTALWORDS[i].timeOut -= 0.03;
		if(HORIZONTALWORDS[i].timeOut < 0.0) HORIZONTALWORDS[i].timeOut = 0.0;
		if(HORIZONTALWORDS[i].timeOut == 0.0)
			putRing(ring.startx,ring.starty,ring.word.length,true);
	}

	for(var i = 0;i<VERTICALWORDS.length;i++)
	{
		var ring = VERTICALWORDS[i];
		VERTICALWORDS[i].timeOut -= 0.03;
		if(VERTICALWORDS[i].timeOut < 0.0) VERTICALWORDS[i].timeOut = 0.0;
		if(VERTICALWORDS[i].timeOut == 0.0)
			putRing(ring.startx,ring.starty,ring.word.length,false);
	}
}

function draw() {
	ctx.clearRect(0,0,canvas.width,canvas.height);

	drawBackground();
	drawBricks();
	showAnimationHiders();
	drawTempBrick();

	drawScore();
	drawButtons();

	updateAnimationBricks();
	drawRings();
	/*
	 var now = (new Date()).getTime();
	ctx.roundRect(35,10,260,120,2);
	ctx.lineWidth = 3;

	ctx.strokeStyle = "#000";
	ctx.stroke();*/
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);