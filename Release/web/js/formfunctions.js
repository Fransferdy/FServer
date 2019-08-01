

function updateNewsPage(clickedElement)
{
	sandbox.spreadMessage({text:"updatenews",data:clickedElement.id});
}

function addPokemonToCompare(clickedElement)
{
	sandbox.spreadMessage({text:"comparePokemon",data:{id:clickedElement.id,type:0}});
}

function addPokemonPCToCompare(clickedElement)
{
	sandbox.spreadMessage({text:"comparePokemon",data:{id:clickedElement.id,type:1}});
}

function deleteNews(clickedElement)
{
	sandbox.spreadMessage({text:"deletenews",data:clickedElement.id});
}

function editNews(clickedElement)
{
	sandbox.spreadMessage({text:"editnews",data:clickedElement.id});
}

function saveEditNews()
{
	sandbox.spreadMessage({text:"saveeditnews",data:{}});
}

function saveCreateNews()
{
	sandbox.spreadMessage({text:"savecreatenews",data:{}});
}

function showNewsCreator()
{
	$('#createNewsDiv').show();
	$('#editNewsDiv').hide();
}

function showNewsEditor()
{
	$('#createNewsDiv').hide();
	$('#editNewsDiv').show();
}

function hideEditors()
{
	$('#createNewsDiv').hide();
	$('#editNewsDiv').hide();
}


function clearComparator()
{
  var clearString = 'Happiness'+
							'<div class="comparatorBarSpace" id="comparatorhappiness"></div>'+
							'Hit Points'+
							'<div class="comparatorBarSpace" id="comparatorhp"></div>'+
							'Attack'+
							'<div class="comparatorBarSpace" id="comparatorattack"></div>'+
							'Defense'+
							'<div class="comparatorBarSpace" id="comparatordefense"></div>'+
							'Special Attack'+
							'<div class="comparatorBarSpace" id="comparatorspattack"></div>'+
							'Special Defense'+
							'<div class="comparatorBarSpace" id="comparatorspdefense"></div>'+
							'Speed'+
							'<div class="comparatorBarSpace" id="comparatorspeed"></div>';
	$("#comparator").html(clearString);
}

function downloadURI(uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
		link.click();
        //after creating link you should delete dynamic link
        //clearDynamicLink(link); 
    }
	
	function printToFile(div) {
        html2canvas(div, {
            onrendered: function (canvas) {
                var myImage = canvas.toDataURL("image/png");
                //create your own dialog with warning before saving file
                //beforeDownloadReadMessage();
                //Then download file
                downloadURI("data:" + myImage, "TrainerCard.png");
            }
        });
    }

function saveTrainerImage()
{
	printToFile($("#trainercard").get());
}

function setCardColorBlue()
{
	$("#trainercard").attr('class', 'trainercardBlue');
	$("#cardcontent").attr('class', 'cardcontentBlue');
	$("#trainername").attr('class', 'trainerNameBlue');
	$.cookie("cardcolor", "Blue", { expires: 768 });
}

function setCardColorRed()
{
	$("#trainercard").attr('class', 'trainercardRed');
	$("#cardcontent").attr('class', 'cardcontentRed');
	$("#trainername").attr('class', 'trainerNameRed');
	$.cookie("cardcolor", "Red", { expires: 768 });
}

function setCardColorGreen()
{
	$("#trainercard").attr('class', 'trainercardGreen');
	$("#cardcontent").attr('class', 'cardcontentGreen');
	$("#trainername").attr('class', 'trainerNameGreen');
	$.cookie("cardcolor", "Green", { expires: 768 });
}

function submitPasswordRequest()
{
	if ($("#email").val()!="")
	{
		$("#requestbutton").hide();
		$("#waitSpinner").show();
		var addurl = "?email="+$("#email").val();
		
		$.ajax
		 ({
			type: 'PUT',
			url: encodeURI('./forgotpassword'+addurl),
			success: function (response)
			{
				console.log(response);
				var retval =	JSON.parse( response );
				if (retval.status=="ok")
				{
					$("#passwordformspace").hide();
					$("#passwordrequestinfo").html("An E-Mail with further instructions was sent to you. <br><br> Since we have a cota of 50 E-Mails a Day, it can reach you in a few minutes from now to up to 72h. <br><br> Also, don't forget to check your Junk/Spam Folder.");
					
				}else
				{
					$("#requestbutton").show();
					$("#waitSpinner").hide();
					printError(retval.message);
				}
				console.log(response);
			}
		  });
	}
}

function submitPasswordReshape()
{
	if ($("#pass1").val()!="")
	{
		if ($("#pass1").val()==$("#pass2").val())
		{
			$("#requestbutton").hide();
			$("#waitSpinner").show();

			var email = getUrlParameter("email");
			var token = getUrlParameter("token");
			var argpass =  MD5($("#pass1").val());
			
			var addurl = "?email="+email+"&token="+token+"&npass="+argpass;
			
			$.ajax
			 ({
				type: 'PATCH',
				url: encodeURI('./forgotpassword'+addurl),
				success: function (response)
				{
					var retval =	JSON.parse( response );
					if (retval.status=="ok")
					{
						$("#passwordformspace").hide();
						$("#passwordrequestinfo").html("Your new password has been set up. Remember that your forum password has been re-shaped to this as well.");
					}else
					{
						$("#requestbutton").show();
						$("#waitSpinner").hide();
						printError(retval.message);
					}
					
				}
			  });
		}
		else
		{
			printError("Passwords are not matching.");
		}
	}
}



function submitAdminLogin()
{

		$("#requestbutton").hide();
		$("#waitSpinner").show();

		
		var argpass =  MD5($("#pass1").val());
		
		var addurl = "?pname="+$("#mail").val()+"&ppass="+argpass;
		
		$.ajax
		 ({
			type: 'PUT',
			url: encodeURI('./admlogin'+addurl),
			success: function (response)
			{
				var retval =	JSON.parse( response );
				if (retval.status=="ok")
				{
					$("#passwordformspace").hide();
					$("#passwordrequestinfo").html('Logged In. <a href="./newseditpage.html"> Proceed To News Writer</a>');
					console.log(retval);
					console.log(retval.data.mail);
					console.log(retval.data.token);
					$.cookie("userEmail", retval.data.mail, { expires: 1 });
					$.cookie("userToken", retval.data.token, { expires: 1 });
				}else
				{
					$("#requestbutton").show();
					$("#waitSpinner").hide();
					printError(retval.message);
				}
				
			}
		  });
}

function submitAdminLogout()
{
	$.removeCookie("userEmail");
	$.removeCookie("userToken");
	location.reload();
}

function submitloginform()
{ 
	if (document.forms["logform"].elements["pname"].value.length>0 && document.forms["logform"].elements["ppass"].value.length>0)
	{
		var pass =  MD5(document.forms["logform"].elements["ppass"].value);

		 $.ajax
		 ({
            type: 'POST',
            url: './login',
            data: {pname: document.forms["logform"].elements["pname"].value, ppass: pass},
            success: function (response)
			{
				var retval =	JSON.parse( response );
				if (retval.status=="ok")
				{
					$.cookie("username", retval.user.name, { expires: 768 });
					$.cookie("usermail", retval.user.email, { expires: 768 });
					$.cookie("usertoken", retval.user.token, { expires: 768 });
					sandbox.spreadMessage( {text:"newuser", data:{} } );
				}else
				{
					console.log(retval.status);
					console.log(retval.message);
					$("#myPopup").html(retval.message+ "<br><a href=\"/passwordrequest.html\">Forgot Your Password?</a>");
					
					 var popup = document.getElementById("myPopup");
					popup.classList.toggle("show");
					
				}
            }
          });
		
		//document.forms["logform"].submit();
	}
}

function submitlogout()
{
	$.removeCookie("username");
	$.removeCookie("usertoken");
	$.removeCookie("usermail");
	sandbox.spreadMessage( {text:"newuser", data:{} } );
}

function submitcontact()
{
	if ($("#name").val().length>0 && $("#email").val().length>0 && $("#subject").val().length>0 && $("#body").val().length>0)
	{
		 $.ajax
		 ({
            type: 'POST',
            url: './contact',
            data: {name: $("#name").val(), email: $("#email").val(),  subject: $("#subject").val(),  body: $("#body").val()},
            success: function (response)
			{
				var retval =	JSON.parse( response );
				if (retval.status=="ok")
				{
					console.log(retval.status);
					console.log(retval.message);
				}else
				{
					console.log(retval.status);
					console.log(retval.message);					
				}
            }
          });
		
		printError("Your message was sent. It may take a while for us to answer it.");
		$("#contact").hide();
	}else
	{
		printError("All fields must be filled.");
	}
}

function submitregform()
{
	if (document.forms["regform"].elements["fname"].value!="")
	{
		if (document.forms["regform"].elements["bdate"].value!="")
		{ 
			if (document.forms["regform"].elements["pass1"].value==document.forms["regform"].elements["pass2"].value)
			{
				if (document.forms["regform"].elements["pass1"].value.length>5 && document.forms["regform"].elements["playname"].value.length>0)
				{
					if (document.forms["regform"].elements["pemail"].value.length>5)
					{
					var argpass =  MD5(document.forms["regform"].elements["pass1"].value);
					var addurl = "?fname="+$("#fname").val()+"&lname="+$("#lname").val()+"&bdate="+$("#bdate").val() +"&country="+$("#countryselect").val()+"&email="+$("#pemail").val() +
					"&playname="+$("#playname").val() +"&pass="+argpass+"&gjname="+$("#gjname").val()+"&gjtoken="+$("#gjtoken").val()+"&ref="+$("#friendref").val()+"&gender="+$('input[name="gender"]:checked').val();
					console.log(addurl);
					
					$("#register").attr("type", "hidden");
					$("#waitSpinner").show();
					printError("");
					
					$.ajax
					 ({
						type: 'PUT',
						url: encodeURI('./login'+addurl),
						success: function (response)
						{
							var retval =	JSON.parse( response );
							if (retval.status=="ok")
							{
								$("#regform").attr("style", "display:none;");
								$("#createaccount").html("Your Account Has Been Created");
								$("#friendmessage").html("<br>A confirmation e-mail was sent to you. Since we have a cota of 50 E-Mails a Day, it can reach you in a few minutes from now to up to 72h. Also, check your spam/junk folder. <br><br> This account grants access to all of our services, Game, Forum and Wiki  <br><br> As soon as you confirm your e-mail, you will be ready to play. <br> <br> <a href=\"./downloads.html\" class=\"btn btn-success\" id=\"registerbutton\">Downloads</a>");
							}else
							{
								$("#register").attr("type", "button");
								$("#waitSpinner").hide();
								printError(retval.message);
							}
							console.log(response);
						}
					  });
		  
					/*
					document.forms["regform"].elements["pass1"].value = MD5(document.forms["regform"].elements["pass1"].value);
					document.forms["regform"].elements["pass2"].value = MD5(document.forms["regform"].elements["pass2"].value);
					value = document.forms["regform"].elements["ppass"].value;
					document.forms["regform"].submit();
					*/					
					}
					else
					{
					printError("Please use a valid email.");
					}
				}else
				{
				printError("Password must be at least 6 characters long. And Player Name at least 1 character long.");
				}
			}else
			{
			printError("Your Password does not match.");
			}
		}else
		{
		printError("Please enter your Birth Date.");
		}
	}else
	{
	printError("Please enter your Full Name.");
	}
}
