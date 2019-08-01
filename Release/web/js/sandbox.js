
var baseaddr = "http://pokemonreo.hopto.org/";
var basepath="web/";

var genders = ["Male", "Female", "Unknow"];

var natures = ["Adamant", "Bashfull", "Bold","Brave","Calm","Careful","Docile","Gentle","Hardy","Hasty","Impish"
,"Jolly","Lax","Lonely","Mild","Modest","Naive","Naughty","QUiet","Quirky","Rash","Relaxed","Sassy","Serious","Timid"];




function headLine(titlearg,bodyarg,datearg,picturearg)
{
	this.title = titlearg;
	this.body = bodyarg;
	this.date = datearg;
	this.picture = picturearg;
}


var sandbox = 
{
	widgets : [],
	retval: {},
	
	registerWidget : function (widgetarg)
	{
		widgetarg.id = this.widgets.length;
		this.widgets[this.widgets.length] = widgetarg;
		widgetarg.create();
		return widgetarg;
	},
	
	//@message = {text:"identifier", data:{}}
	spreadMessage : function (message)
	{
		for (var i = 0, l = this.widgets.length; i<l; i++ )
		{
			this.widgets[i].onMessage(message); 
		}
	},
	
	onPageLoad : function ()
	{
		for (var i = 0, l = this.widgets.length; i<l; i++ )
		{
			this.widgets[i].onPageLoad(); 
		}
		
		
	},
	
	onInit : function ()
	{
		for (var i = 0, l = this.widgets.length; i<l; i++ )
		{
			this.widgets[i].onInit(); 
		}
	},
	
	getHeadlines : function(start,amount,widget)
	{
		$.ajax
		({
			url: encodeURI('./news?start='+start+'&amount='+amount),
			type: 'GET',
			success: function(result) 
			{
				var retval =	JSON.parse( result );
				if (retval.status=="ok")
				{
					widget.data = retval;
					widget.wake();
				}else
				{
					console.log(result);
				}
			}
		});
	},
	
	getUser : function(widget)
	{
		var username = $.cookie("username");
		var usertoken = $.cookie("usertoken");
		var usermail = $.cookie("usermail");

		if (username!=undefined && usertoken!=undefined )
		{
			widget.data = 
			{
				name : username,
				token: usertoken,
				email : usermail
			}
			widget.wake();
			return;
		}
		
			widget.data = 
			{
				name : "guest",
				token: "token"
			}
			widget.wake();
			return;
	},
	
	getFullAccount : function(widget)
	{
		$.ajax
		({
			url: './account',
			type: 'GET',
			success: function(result) 
			{
				var retval =	JSON.parse( result );
				if (retval.status=="error")
				{
					console.log(result);
					$("#errordiv").show();
					$("#successdiv").hide();
				}else
				{
					if (retval.status=="bad")
					{
						console.log(result);
					}
					widget.data = retval;
					widget.wake();
				}
			}
		});
		
	}
	
}

function widgetBase(self)
{
	self.create = function () {};
	self.onPageLoad = function () {};
	self.onInit = function () {};
	self.wake = function () {};
	self.onMessage = function(message) {};
	self.data = {};
}



function headlineWidget()
{
	widgetBase(this);
	this.headlines = [];
	
	this.onPageLoad = function () 
	{
		sandbox.getHeadlines(0,3,this);
	};
	
	this.wake = function () 
	{
		this.headlines = this.data.news;
		for (var i = 0, l = this.headlines.length; i<l; i++ )
		{
			console.log(this.headlines[i].title);
			$("#headtitle"+i).html(this.headlines[i].title);
			$("#headbody"+i).html(this.headlines[i].body);
			$("#headmail"+i).attr("src", "https://www.gravatar.com/avatar/"+this.headlines[i].email);
		}
	};
}

function generateNewsField(newsid)
{
		var retField =  '<div  id="news'+newsid+'">'+
		' <div class="newsprofile">'+
		' <img class="img-circle" id="headmail'+newsid+'" src="https://www.gravatar.com/avatar/93e5ac42014dcf46bfb355515a" alt="Dev Picture" width="80" height="80"><br> <br> <br>'+
		'<a onClick="deleteNews(this)" class=" btn btn-warning" id="delete'+newsid+'">Delete</a>'+
		'</div> '+
		' <span class="clearcss"></span>'+
		' <h2 id="headtitle'+newsid+'">Loading...</h2>'+
		' <p id="headbody'+newsid+'">Please wait.</p> <br>'+
		'  <p id="newsdate'+newsid+'" class="datetext">Written in 01/02/2017</p>'+
		'<a onClick="editNews(this)" class="btn btn-primary" id="edit'+newsid+'">Edit</a> '+
		'<table width=800px;><tr><td></td><td></td></tr></table>'+
		'   <hr class="featurette-divider-small">'+
		'</div>';
		return retField;
}


function editNewsPageWidget()
{
	widgetBase(this);
	this.headlines = [];
	this.amount=5;
	this.start=0;
	this.totalAmount = -1;
	
	this.onPageLoad = function () 
	{
		sandbox.getHeadlines(0,1,this);
	};
	
	this.wake = function () 
	{
		if (this.totalAmount==-1)
		{
			if (!$.cookie("userEmail") || !$.cookie("userToken") )
			{
				$('#classified').html('<p class="lead" >You do not have access permission to this page.</p>');
				return;
			}
			this.totalAmount =  this.data.newsamount;
			sandbox.getHeadlines(0,this.totalAmount+10,this );
			
			$('#newscreator').sceditor
			({
				style: 'minified/jquery.sceditor.default.min.css'
			});
			$('#newsedit').sceditor
			({
				style: 'minified/jquery.sceditor.default.min.css'
			});
	
			return;
		}
		
		var index;
		this.headlines = this.data.news;
		this.totalAmount =  this.data.newsamount;
		
		//print all news
		for (var i = 0, l = this.headlines.length; i<l; i++ )
		{
			
			$("#newscolumn").append(generateNewsField(i));
			
			$("#headtitle"+i).html(this.headlines[i].title);
			$("#headbody"+i).html(this.headlines[i].body);
			console.log(this.headlines[i].body);
			$("#headmail"+i).attr("src", "https://www.gravatar.com/avatar/"+this.headlines[i].email);
			$("#newsdate"+i).html("Written in "+this.headlines[i].date);
			$("#news"+i).show();
		}		
	};
	
	this.onMessage = function(message) 
	{
		
		if (message.text=="editnews")
		{
			var idText;
			var idNumber;
			idText = message.data.substr(4,8);
			idNumber = parseInt(idText);
			
			$('#createNewsDiv').hide();
			$('#editNewsDiv').show();
			$('#newsedit').sceditor('instance').val("");
			$('#newsedit').sceditor('instance').insert(this.headlines[idNumber].body);
			$('#newseditid').val(this.headlines[idNumber].did);
			$('#newsedittitle').val(this.headlines[idNumber].title);
			
			$(document.body).scrollTop($('#friendmessage').offset().top);
		}
		
		if (message.text=="saveeditnews")
		{
			if ($('#newseditid').val()!="")
			{
				$.ajax
				({
					url: './news?nid='+$('#newseditid').val()+'&title='+encodeURI($('#newsedittitle').val())+'&body='+encodeURI($('#newsedit').sceditor('instance').val()),
					type: 'PATCH',
					success: function(result) 
					{
						var retval =	JSON.parse( result );
						if (retval.status=="ok")
						{
							location.reload();
						}
						console.log(result);
					}
				});
			}
		}
		
		if (message.text=="savecreatenews")
		{
			if ($('#newscreatetitle').val()!="")
			{
				$.ajax
				({
					url: './news?title='+encodeURI($('#newscreatetitle').val())+'&body='+encodeURI($('#newscreator').sceditor('instance').val()),
					type: 'PUT',
					success: function(result) 
					{
						var retval =	JSON.parse( result );
						if (retval.status=="ok")
						{
							location.reload();
						}
						console.log(result);
					}
				});
			}
		}
		
		if (message.text=="deletenews")
		{
			var idText;
			var idNumber;
			idText = message.data.substr(6,10);
			idNumber = parseInt(idText);
			
			$.ajax
			({
				url: encodeURI('./news?nid='+this.headlines[idNumber].did),
				type: 'DELETE',
				success: function(result) 
				{
					var retval =	JSON.parse( result );
					if (retval.status=="ok")
					{
						$('#news'+idNumber).hide();
					}
					console.log(result);
				}
			});
		}
		
	};
	
}

function newsPageWidget()
{
	widgetBase(this);
	this.headlines = [];
	this.amount=5;
	this.start=0;
	this.totalAmount =0;
	
	this.onPageLoad = function () 
	{
		sandbox.getHeadlines(this.start,this.amount,this);
	};
	
	this.wake = function () 
	{
		var index;
		this.headlines = this.data.news;
		this.totalAmount =  this.data.newsamount;
		
		for (var i = 0, l = this.headlines.length; i<l; i++ )
		{
			$("#headtitle"+i).html(this.headlines[i].title);
			$("#headbody"+i).html(this.headlines[i].body);
			$("#headmail"+i).attr("src", "https://www.gravatar.com/avatar/"+this.headlines[i].email);
			$("#date"+i).html("Written in "+this.headlines[i].date);
			$("#news"+i).show();
		}
		
		//hide elements outside receive range
		if (this.totalAmount<(this.start+this.amount))
		{
			for (var i = this.headlines.length, l = this.amount; i<l; i++ )
			{
				$("#news"+i).hide();
			}
		}
		
		var maxPosts = Math.ceil(this.totalAmount/this.amount);
		var postPos=0;	
		for (var i = 1, l = 6; i<l; i++ )
		{
			postPos = parseInt($("#t"+i).html());
			if (postPos>maxPosts)
				$("#t"+i).hide();
			else
				$("#t"+i).show();
		}
		
		if ((this.start/this.amount)+1>Math.ceil(this.totalAmount/this.amount)-1)
			$("#t6").hide();
		else
			$("#t6").show();
	};
	
	
	this.onMessage = function(message) 
	{
		if (message.text=="updatenews")
		{
			var newStart;
			
			for (var i = 0, l = 6; i<l; i++ )
			{
				$("#bt"+i).attr("class", "inactive");
			}
			
			
			var currentStart = this.start/this.amount;
			console.log("currentStart "+currentStart);
			if (currentStart>2)
			{
				var indexChange=0;
				
				if (message.data=="t0")
					indexChange=-1;
				if (message.data=="t1")
					indexChange=-2;
				if (message.data=="t2")
					indexChange=-1;
				if (message.data=="t3")
					indexChange=0;
				if (message.data=="t4")
					indexChange=+1;
				if (message.data=="t5")
					indexChange=+2;
				if (message.data=="t6")
					indexChange=+1;
				
				newStart = currentStart+indexChange;	
				console.log("indexC "+indexChange);
			}else
			{
				if (message.data=="t0")
				{
					newStart=currentStart-1;
					if (newStart<0)
						newStart=0;
				}
				if (message.data=="t1")
					newStart=0;
				if (message.data=="t2")
					newStart=1;
				if (message.data=="t3")
					newStart=2;
				if (message.data=="t4")
					newStart=3;
				if (message.data=="t5")
					newStart=4;
				if (message.data=="t6")
					newStart=currentStart+1;
				console.log("NewStart "+newStart);
			}
			
			if (newStart>=2)
			{
				for (var i = 1, l = 6; i<l; i++ )
				{
					$("#t"+i).html(""+(newStart-2+i));
				}
				$("#bt3").attr("class", "active");
			}else
			{
				for (var i = 1, l = 6; i<l; i++ )
				{
					$("#t"+i).html(""+(i));
				}
				if (newStart==0)
					$("#bt1").attr("class", "active");
				if (newStart==1)
					$("#bt2").attr("class", "active");
			}
			
			this.start = newStart*this.amount;
			sandbox.getHeadlines(this.start,this.amount,this);
		}
		
		
	};
	
}

function loginWidget()
{
	widgetBase(this);
	this.user = {};
	
	this.onPageLoad = function () 
	{
		sandbox.getUser(this);
	};
	
	this.onMessage = function(message) 
	{
		if (message.text=="newuser")
			sandbox.getUser(this);
		
	};
	
	this.wake = function () 
	{
		this.user = this.data;
		if (this.user.name!="guest")
		{
			$("#ppass").attr("type", "hidden");
			$("#pname").attr("type", "hidden");
			$("#login").attr("type", "hidden");
			
			$("#logout").attr("type", "button");
			$("#playername").html(this.user.name+", ");
			$("#playermessage").show();
			$("#myaccount").show();
			
		}else
		{
			$("#ppass").attr("type", "password");
			$("#pname").attr("type", "text");
			$("#login").attr("type", "button");
			
			$("#logout").attr("type", "hidden");
			$("#playermessage").hide();
			$("#myaccount").hide();
		}
		
		
	};
	
}


function activationWidget()
{
	widgetBase(this);
	this.user = {};
	
	this.onPageLoad = function () 
	{
		$("#waitSpinner").show();

		var email = getUrlParameter("email");
		var token = getUrlParameter("token");
		
		var addurl = "?email="+email+"&token="+token;
		
		$.ajax
		 ({
			type: 'PATCH',
			url: encodeURI('./login'+addurl),
			success: function (response)
			{
				console.log(response);
				var retval =	JSON.parse( response );
				if (retval.status=="ok")
				{
					$("#waitSpinner").hide();
					$("#requestinfo").html("Your account has been activated. <br><br>You can now play the game and access our forums.");
				}else
				{
					$("#waitSpinner").hide();
					printError(retval.message);
				}
			}
		  });
	};
}


function registerWidget()
{
	widgetBase(this);
	
	this.onPageLoad = function () 
	{
		var referrer  = findGetParameter("ref");
		if (referrer!=null)
		{
			$("#friendmessage").html("Your friend "+referrer+" is giving you 3 Great Balls!");
			$("#friendref").attr("value", referrer);
		}
		$.getJSON('http://gd.geobytes.com/GetCityDetails?callback=?', function(data) 
			{
				document.getElementById("countryselect").value = data.geobytesinternet;
			});
	};
	
}





function generatePokemonDisplayString(pokemon, pokemonId)
{	
	var pkmnumber=""+pokemon.dexid;
	var imageString = "";
	var displayString;
		
	if (pokemon.dexid<100)
		pkmnumber="0"+pokemon.dexid;
	
	if (pokemon.dexid<10)
		pkmnumber="00"+pokemon.dexid;
	
	if (pokemon.shiny)
		imageString = 'http://www.serebii.net/Shiny/XY/'+pkmnumber+'.png'
	else
		imageString = 'http://www.serebii.net/xy/pokemon/'+pkmnumber+'.png';
	
	
	displayString = '<div class= "pokemonDisplay" id="pokemont'+pokemonId+'">'+
			'<div class="pokemonData" id ="pokemontd'+pokemonId+'">'+
				'Happiness'+
				'<div class="barYellow" id = "pokemonthappy'+pokemonId+'"> '+pokemon.happiness+'</div>'+
				'Hit Points'+
				'<div class="barRed" id = "pokemonthp'+pokemonId+'">'+pokemon.hp+'</div>'+
				'Attack'+
				'<div class="barDarkRed" id = "pokemontattack'+pokemonId+'">'+pokemon.attack+'</div>'+
				'Defense'+
				'<div class="barBlue" id = "pokemontdefense'+pokemonId+'">'+pokemon.defense+'</div>'+
				'Sp Attack'+
				'<div class="barPurple" id = "pokemontspattack'+pokemonId+'">'+pokemon.spattack+'</div>'+
				'Sp Defense'+
				'<div class="barDarkBlue" id = "pokemontspdefense'+pokemonId+'">'+pokemon.spdefense+'</div>'+
				'Speed'+
				'<div class="barGreen" id = "pokemontspeed'+pokemonId+'">'+pokemon.speed+'</div>'+
			'</div>'+
			'<div class= "pokemonPicture" id="pokemontp'+pokemonId+'">'+
			'<div id = "pokemontinfo'+pokemonId+'">'+
			'		'+pokemon.name+' <br>'+
			'		National Dex : '+pokemon.dexid+' <br>'+
			'		Gender: '+genders[pokemon.gender]+' <br>'+
			'		Level: '+pokemon.lvl+' <br>'+
			'		Nature: '+natures[pokemon.nature]+' <br>'+
			'	</div>'+
			'<img src="'+imageString+'" id="pokemontImage'+pokemonId+'">'+
			'<br><br><a onClick="addPokemonToCompare(this);" class="btn btn-success" id="addcomparepokemon'+pokemonId+'">AddToCompare</a> <br><br>'+
			'</div>'+
			'<div class="clearcss"></div>'+
		'</div>';
		
		return displayString;
	
}

function generatePokemonPCDisplayString(pokemon, pokemonId)
{	
	var pkmnumber=""+pokemon.dexid;
	var imageString = "";
	var displayString;
		
	if (pokemon.dexid<100)
		pkmnumber="0"+pokemon.dexid;
	
	if (pokemon.dexid<10)
		pkmnumber="00"+pokemon.dexid;
	
	if (pokemon.shiny)
		imageString = 'http://www.serebii.net/Shiny/XY/'+pkmnumber+'.png'
	else
		imageString = 'http://www.serebii.net/xy/pokemon/'+pkmnumber+'.png';
	
	
	displayString = '<div class= "pokemonDisplay" id="pokemonpc'+pokemonId+'">'+
			'<div class="pokemonData" id ="pokemonpcd'+pokemonId+'">'+
				'Happiness'+
				'<div class="barYellow" id = "pokemonpchappy'+pokemonId+'"> '+pokemon.happiness+'</div>'+
				'Hit Points'+
				'<div class="barRed" id = "pokemonpchp'+pokemonId+'">'+pokemon.hp+'</div>'+
				'Attack'+
				'<div class="barDarkRed" id = "pokemonpcattack'+pokemonId+'">'+pokemon.attack+'</div>'+
				'Defense'+
				'<div class="barBlue" id = "pokemonpcdefense'+pokemonId+'">'+pokemon.defense+'</div>'+
				'Sp Attack'+
				'<div class="barPurple" id = "pokemonpcspattack'+pokemonId+'">'+pokemon.spattack+'</div>'+
				'Sp Defense'+
				'<div class="barDarkBlue" id = "pokemonpcspdefense'+pokemonId+'">'+pokemon.spdefense+'</div>'+
				'Speed'+
				'<div class="barGreen" id = "pokemonpcspeed'+pokemonId+'">'+pokemon.speed+'</div>'+
			'</div>'+
			'<div class= "pokemonPicture" id="pokemonpcp'+pokemonId+'">'+
			'<div id = "pokemonpcinfo'+pokemonId+'">'+
			'		'+pokemon.name+' <br>'+
			'		National Dex : '+pokemon.dexid+' <br>'+
			'		Gender: '+genders[pokemon.gender]+' <br>'+
			'		Level: '+pokemon.lvl+' <br>'+
			'		Nature: '+natures[pokemon.nature]+' <br>'+
			'	</div>'+
			'<img src="'+imageString+'" >'+
			'<br><br><a onClick="addPokemonPCToCompare(this);" class="btn btn-success" id="addcomparepokemon'+pokemonId+'">AddToCompare</a> <br><br>'+
			'</div>'+
			'<div class="clearcss"></div>'+
		'</div>';
		
		return displayString;
	
}

function addComparatorBars(pokemon, barid)
{
	var happiness;
	happiness = ((pokemon.happiness/255)*100);
	if (happiness>=100)
		happiness=99;
	
	$("#comparatorhappiness").append('<div class="barYellow" id = "happybar'+barid+'" > '+pokemon.happiness+' '+pokemon.name+'</div>');
	$("#comparatorhp").append('<div class="barRed" id = "hpbar'+barid+'" > '+pokemon.hp+' '+pokemon.name+'</div>');
	$("#comparatorattack").append('<div class="barDarkRed" id = "attackbar'+barid+'" > '+pokemon.attack+' '+pokemon.name+'</div>');
	$("#comparatordefense").append('<div class="barBlue" id = "defensebar'+barid+'" > '+pokemon.defense+' '+pokemon.name+'</div>');
	$("#comparatorspattack").append('<div class="barPurple" id = "spattackbar'+barid+'" > '+pokemon.spattack+' '+pokemon.name+'</div>');
	$("#comparatorspdefense").append('<div class="barDarkBlue" id = "spdefensebar'+barid+'" > '+pokemon.spdefense+' '+pokemon.name+'</div>');
	$("#comparatorspeed").append('<div class="barGreen" id = "speedbar'+barid+'" > '+pokemon.speed+' '+pokemon.name+'</div>');

	$("#happybar"+barid).width(""+happiness+"%");
	$("#hpbar"+barid).width(""+((pokemon.hp/715)*100)+"%");
	$("#attackbar"+barid).width(""+((pokemon.attack/505)*100)+"%");
	$("#defensebar"+barid).width(""+((pokemon.defense/615)*100)+"%");
	$("#spattackbar"+barid).width(""+((pokemon.spattack/505)*100)+"%");
	$("#spdefensebar"+barid).width(""+((pokemon.spdefense/615)*100)+"%");
	$("#speedbar"+barid).width(""+((pokemon.speed/505)*100)+"%");
}


function myAccountWidget()
{
	widgetBase(this);
	this.user = {};
	this.fullAccount = {};
	this.action = 0;
	this.comparatorIndex=0;
	
	this.onPageLoad = function () 
	{
		$("#waitSpinner").show();
		sandbox.getFullAccount(this);
	};
	
	this.onMessage = function(message) 
	{
		if (message.text=="newuser")
		{
			if (message.data.myAccIgnore!=undefined)
				return;
			
			sandbox.getFullAccount(this);
		}
		
		
		if (message.text=="comparePokemon")
		{
			var pokemonIdText;
			var pokeIdNumber;
			
			var barid=this.comparatorIndex;
			this.comparatorIndex++;
			pokemonIdText = message.data.id.substr(17,21);
			pokeIdNumber = parseInt(pokemonIdText);
			
			if (message.data.type==0)//pokemont
			{
				addComparatorBars(this.fullAccount.pokemont[pokeIdNumber],barid);
			}else
			{
				addComparatorBars(this.fullAccount.pokemonpc[pokeIdNumber],barid);
			}
			
		}
	};
	

	this.wake = function () 
	{  
		if (this.data.status=="bad")
		{
			$.removeCookie("username");
			$.removeCookie("usertoken");
			$.removeCookie("usermail");		
			$("#successdiv").hide();
			$("#errordiv").show();
			$("#waitSpinner").hide();
			
			sandbox.spreadMessage( {text:"newuser", data:{myAccIgnore:1} } );
			return;
		}
		
		$("#waitSpinner").hide();
		
		
		if ($.cookie("cardcolor"))
		{
			$("#trainercard").attr('class', 'trainercard'+$.cookie("cardcolor"));
			$("#cardcontent").attr('class', 'cardcontent'+$.cookie("cardcolor"));
			$("#trainername").attr('class', 'trainerName'+$.cookie("cardcolor"));
		}
		
		this.fullAccount = this.data.account;
		
		$("#reflink").html(baseaddr+basepath+"register.html?ref="+this.fullAccount.playername);
		
		$("#trainername").html(this.fullAccount.playername);
		$("#cardplaytime").html("PLAY TIME: "+this.fullAccount.playtime);
		$("#cardlevel").html("LEVEL: "+this.fullAccount.playerlevel);
		$("#cardmoney").html("MONEY: "+this.fullAccount.money);
		$("#cardshout").html("BATTLE SHOUT: "+this.fullAccount.battleText);
		
		$("#trainerimage").attr("src", "./imgs/trainers/TrainerCard318_"+this.fullAccount.trainerset+".png");
		
		for(i=0;i<40;i++)
		{
			if (this.fullAccount.badges[i])
			{
				$("#badge"+i).attr("src", "./imgs/badges/badges_85_"+i+".png");
			}	
		}
		
		for(i=0;i<5;i++)
		{
			if (this.fullAccount.badges[40+i])
			{
				$("#trophy"+i).attr("src", "./imgs/trophies/trophies385_"+i+".png");
			}	
		}
		
		var happiness=0;
		for(i=0,imax=this.fullAccount.pokemont.length;i<imax;i++)
		{
			console.log("poke "+i+ " dex "+ this.fullAccount.pokemont[i].dexid );
			if (this.fullAccount.pokemont[i].dexid>0)
			{
				$("#pokemonTeam").append(generatePokemonDisplayString(this.fullAccount.pokemont[i],i));
				
				happiness = ((this.fullAccount.pokemont[i].happiness/255)*100);
				if (happiness>100)
					happiness=100;
				$("#pokemonthappy"+i).width(""+happiness+"%");
				$("#pokemonthp"+i).width(""+((this.fullAccount.pokemont[i].hp/715)*100)+"%");
				$("#pokemontattack"+i).width(""+((this.fullAccount.pokemont[i].attack/505)*100)+"%");
				$("#pokemontdefense"+i).width(""+((this.fullAccount.pokemont[i].defense/615)*100)+"%");
				$("#pokemontspattack"+i).width(""+((this.fullAccount.pokemont[i].spattack/505)*100)+"%");
				$("#pokemontspdefense"+i).width(""+((this.fullAccount.pokemont[i].spdefense/615)*100)+"%");
				$("#pokemontspeed"+i).width(""+((this.fullAccount.pokemont[i].speed/505)*100)+"%");
			}
		}
		
		$("#pokemonTeam").append('<div class="clearcss"></div>');
		
		happiness=0;
		for(i=0,imax=this.fullAccount.pokemonpc.length;i<imax;i++)
		{
			console.log("poke "+i+ " dex "+ this.fullAccount.pokemonpc[i].dexid );
			if (this.fullAccount.pokemonpc[i].dexid>0)
			{
				$("#pokemonPC").append(generatePokemonPCDisplayString(this.fullAccount.pokemonpc[i],i));
				
				happiness = ((this.fullAccount.pokemonpc[i].happiness/255)*100);
				if (happiness>100)
					happiness=100;
				$("#pokemonpchappy"+i).width(""+happiness+"%");
				$("#pokemonpchp"+i).width(""+((this.fullAccount.pokemonpc[i].hp/715)*100)+"%");
				$("#pokemonpcattack"+i).width(""+((this.fullAccount.pokemonpc[i].attack/505)*100)+"%");
				$("#pokemonpcdefense"+i).width(""+((this.fullAccount.pokemonpc[i].defense/615)*100)+"%");
				$("#pokemonpcspattack"+i).width(""+((this.fullAccount.pokemonpc[i].spattack/505)*100)+"%");
				$("#pokemonpcspdefense"+i).width(""+((this.fullAccount.pokemonpc[i].spdefense/615)*100)+"%");
				$("#pokemonpcspeed"+i).width(""+((this.fullAccount.pokemonpc[i].speed/505)*100)+"%");
			}
		}
		
		$("#pokemonPC").append('<div class="clearcss"></div>');
		
		$("#errordiv").hide();
		$("#successdiv").show();
		
			//$("#headmail"+i).attr("src", "https://www.gravatar.com/avatar/"+this.headlines[i].email);
	};
	
}




window.onload = function()
{
	sandbox.onPageLoad();	
};








