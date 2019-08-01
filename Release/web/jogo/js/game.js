//INITIATE SYSTEMS================================================================================
		var activated2d = true;
		var DZ = 0;
		
		//INPUT SYSTEM
		var key = 
		{
			//vetores de teclas pressionadas
			_pressKeys : [], 
			_pressedKeys : [],
			_releasedKeys : [],
			
			pressed : function (keyCode) //para teclas que foram pressionadas 
			{
				return this._pressedKeys[keyCode];
			},
			
			press : function (keyCode) //teclas que estao pressionadas
			{
				return this._pressKeys[keyCode];
			},
			
			released : function (keyCode) // teclas que foram soltas
			{
				return this._releasedKeys[keyCode];
			},
			
			_setPress : function(keyCode)
			{
				this._pressedKeys[keyCode] = true;
				this._pressKeys[keyCode] = true;
			},
			
			_deletePress : function(keyCode)
			{
				this._releasedKeys[keyCode] = true;
				delete this._pressKeys[keyCode];
			},
			
			cleanSystem : function()
			{
					this._pressedKeys.length = 0;
					this._releasedKeys.length = 0;
			}		
		}
		
		
		
		document.addEventListener('keydown', function(event) { key._setPress(event.keyCode); }, false); //evento que aciona o sistema de input para teclas pressionadas
		document.addEventListener('keyup', function(event) {key._deletePress(event.keyCode); }, false); //evento que aciona o sistema de input para teclas soltas
		
		
		function ord(string) //retorna o codigo asci de uma tecla
		{
			return string.charCodeAt(0);
		}
		
		
		
		var canvas = document.getElementById("game-canvas");
		
		//adiciona evento de touch ou mouse para dispositivos mobile
		if ("ontouchstart" in document.documentElement)
        {
          canvas.addEventListener("touchstart", downFunction, false);
        }
        else
        {
          canvas.addEventListener("mousedown", downFunction, false);
        }
		
		if ("ontouchend" in document.documentElement)
        {
          canvas.addEventListener("touchend", upFunction, false);
        }
        else
        {
          canvas.addEventListener("mouseup", upFunction, false);
        }
		
		//touch simula apertar w
		function downFunction() {
			key._pressedKeys[ord("W")]=true;
			key._pressedKeys[13]=true;
		}
		
		//touch simula soltar w
		function upFunction() {
			key._releasedKeys[ord("W")]=true;
			key._releasedKeys[13]=true;
		}
		
		//inicializa o vetor de sons e os sons
		var sounds = [];
		sounds ['bgm'] = new Howl
		(
			{
				urls: ['sounds/Clocktower.mp3'],
				loop:true,
				buffer:true
			}	
		); 
		
		sounds ['jump'] = new Howl
		(
			{
				urls: ['sounds/jump.mp3'],
				buffer:true
			}	
		); 
		
		sounds ['bate'] = new Howl
		(
			{
				urls: ['sounds/bate.mp3'],
				buffer:true
			}	
		); 
		
		sounds ['health'] = new Howl
		(
			{
				urls: ['sounds/health.mp3'],
				buffer:true
			}	
		); 
		
		//verifica se o dispositivo eh mobile
		var isMobile = {
		Android: function() {
			return navigator.userAgent.match(/Android/i);
		},
		BlackBerry: function() {
			return navigator.userAgent.match(/BlackBerry/i);
		},
		iOS: function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
		Opera: function() {
			return navigator.userAgent.match(/Opera Mini/i);
		},
		Windows: function() {
			return navigator.userAgent.match(/IEMobile/i);
		},
		any: function() {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};
		
		//cria a tela do jogo
		var currentdate = new Date(); //usado para calcular fps
		
		
		var width =  document.getElementById("game-canvas").clientWidth ;//1024;//window.innerWidth;
        var height = document.getElementById("game-canvas").clientHeight;//window.innerHeight;
		
		var viewport = 
		{
			width  : (window.innerWidth > 0) ? window.innerWidth : screen.width,
			height : (window.innerHeight > 0) ? window.innerHeight : screen.height
		};
		
		//cria um container para os graficos
		var scene_UI = new PIXI.Stage( 0x66FF99 );
		scene_UI.width = width;
		scene_UI.height = height;
       
		//cria um renderizador de canvas
		var canvas_UI =  new PIXI.CanvasRenderer(width, height,{transparent:true,view:document.getElementById("game-canvas")});
		
        canvas_UI.view.style.position = "absolute";
        canvas_UI.view.style.top = "0px";
        canvas_UI.view.style.left = "0px";
		
		//calcular tamanho da tela do jogo no browser
		var absWidthDif = Math.abs(width-viewport.width);	
		var absHeightDif = Math.abs(height-viewport.height);
		
		if (absHeightDif<absWidthDif)
		{
			canvas_UI.view.style.width = viewport.width;
			canvas_UI.view.style.height =  viewport.height;
		}
		
		//cria outro container grafico
		var world2d = new PIXI.DisplayObjectContainer();
		world2d.x = 0;
		world2d.y = 0;
		world2d.width = scene_UI.width;
		world2d.heigth = scene_UI.height;
		world2d.depth = 300;
		scene_UI.addChild(world2d);
		
		document.body.appendChild( canvas_UI.view );
		
		
		//cria um no para lista de colisao
		function Node (fatherarg,dataarg)
		{
			this.father = fatherarg;
			this.dataob=dataarg;
			this.next=null;
		}
		
		//cria uma lista para colisoes
		function List (firstdataob)
		{
			this.first = new Node (null, firstdataob);
			this.last = this.first;
		}
		
		//vetor de imagens
		var textures = [];
		
		//carrega as imagens no vetor de imagens
		function loadBasicTextures()
		{
			textures["spike"] = PIXI.Texture.fromImage("imgs/spike.png");
			textures["lostpage"] = PIXI.Texture.fromImage("imgs/lost.png");
			textures["setae"] = PIXI.Texture.fromImage("imgs/setae.png");
			textures["setad"] = PIXI.Texture.fromImage("imgs/setad.png");
			textures["coracao"] = PIXI.Texture.fromImage("imgs/coracao.png");
			textures["intrucoes.png"] = PIXI.Texture.fromImage("imgs/intrucoes.png");
			textures["help.png"] = PIXI.Texture.fromImage("imgs/help.png");
			
			for(var i=0;i<3;i++)
			{
			textures["ghost-"+i] = PIXI.Texture.fromImage("imgs/ghost2-"+i+".png");
			}
			
			for(var i=0;i<5;i++)
			{
			textures["monster-"+i] = PIXI.Texture.fromImage("imgs/monster-"+i+".png");
			}
			
			for(var i=0;i<4;i++)
			{
			textures["fog-"+i] = PIXI.Texture.fromImage("imgs/fog-"+i+".png");
			}
			
			
			textures["background"] = PIXI.Texture.fromImage("imgs/foresbackground.png");
			textures["title"] = PIXI.Texture.fromImage("imgs/title.png");
			textures["title2"] = PIXI.Texture.fromImage("imgs/title2.png");
			
			textures["vida"] = PIXI.Texture.fromImage("imgs/vidas.png");
			

			
			textures["tile-128-0"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-0.png"); 
			textures["tile-0-256"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-256.png"); 
			textures["tile-32-256"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-256.png"); 
			textures["tile-64-256"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-256.png"); 
			textures["tile-0-32"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-32.png"); 
			textures["tile-64-288"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-288.png"); 
			textures["tile-32-32"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-32.png"); 
			textures["tile-64-32"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-32.png"); 
			textures["tile-32-0"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-0.png"); 
			textures["tile-64-0"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-0.png"); 
			textures["tile-0-0"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-0.png"); 
			textures["tile-96-288"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-288.png"); 
			textures["tile-128-288"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-288.png"); 
			textures["tile-160-288"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-288.png"); 
			textures["tile-0-768"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-768.png"); 
			textures["tile-32-768"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-768.png"); 
			textures["tile-64-768"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-768.png"); 
			textures["tile-96-768"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-768.png"); 
			textures["tile-128-768"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-768.png"); 
			textures["tile-64-448"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-448.png"); 
			textures["tile-0-352"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-352.png"); 
			textures["tile-64-352"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-352.png"); 
			textures["tile-0-320"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-320.png"); 
			textures["tile-64-320"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-320.png"); 
			textures["tile-0-288"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-288.png"); 
			textures["tile-0-960"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-960.png"); 
			textures["tile-32-960"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-960.png"); 
			textures["tile-32-992"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-992.png"); 
			textures["tile-0-992"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-992.png"); 
			textures["tile-128-384"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-384.png"); 
			textures["tile-128-416"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-416.png"); 
			textures["tile-160-384"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-384.png"); 
			textures["tile-160-416"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-416.png"); 
			textures["tile-96-416"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-416.png"); 
			textures["tile-0-384"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-384.png"); 
			textures["tile-0-416"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-416.png"); 
			textures["tile-32-416"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-416.png"); 
			textures["tile-128-576"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-576.png"); 
			textures["tile-128-608"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-608.png"); 
			textures["tile-160-576"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-576.png"); 
			textures["tile-160-608"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-608.png"); 
			textures["tile-64-1344"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-1344.png"); 
			textures["tile-32-1792"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-1792.png"); 
			textures["tile-32-1824"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-1824.png"); 
			textures["tile-64-1792"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-1792.png"); 
			textures["tile-64-1824"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-1824.png"); 
			textures["tile-96-1792"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-1792.png"); 
			textures["tile-96-1824"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-1824.png"); 
			textures["tile-128-1792"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-1792.png"); 
			textures["tile-128-1824"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-1824.png"); 
			textures["tile-160-1792"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-1792.png"); 
			textures["tile-160-1824"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-1824.png"); 
			textures["tile-64-1760"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-1760.png"); 
			textures["tile-96-1760"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-1760.png"); 
			textures["tile-128-1760"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-1760.png"); 
			textures["tile-160-1760"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-1760.png"); 
			textures["tile-64-1664"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-1664.png"); 
			textures["tile-96-1664"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-1664.png"); 
			textures["tile-128-1664"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-1664.png"); 
			textures["tile-160-1664"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-1664.png"); 
			textures["tile-64-1632"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-1632.png"); 
			textures["tile-96-1600"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-1600.png"); 
			textures["tile-128-1600"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-1600.png"); 
			textures["tile-96-1632"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-1632.png"); 
			textures["tile-128-1632"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-1632.png"); 
			textures["tile-160-1632"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-1632.png"); 
			textures["tile-0-1632"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-1632.png"); 
			textures["tile-0-1664"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-1664.png"); 
			textures["tile-32-1632"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-1632.png"); 
			textures["tile-32-1664"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-1664.png"); 
			textures["tile-64-2112"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-2112.png"); 
			textures["tile-64-2144"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-2144.png"); 
			textures["tile-96-2112"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-2112.png"); 
			textures["tile-96-2144"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-2144.png"); 
			textures["tile-0-1760"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-1760.png"); 
			textures["tile-160-1280"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-1280.png"); 
			textures["tile-160-1216"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-1216.png"); 
			textures["tile-160-1184"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-1184.png"); 
			textures["tile-128-1120"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-1120.png"); 
			textures["tile-0-1088"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-1088.png"); 
			textures["tile-32-1088"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-1088.png"); 
			textures["tile-160-1120"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-1120.png"); 
			textures["tile-64-1504"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-1504.png"); 
			textures["tile-64-1536"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-1536.png"); 
			textures["tile-64-1568"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-1568.png"); 
			textures["tile-96-1504"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-1504.png"); 
			textures["tile-96-1536"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-1536.png"); 
			textures["tile-96-1568"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-1568.png"); 
			textures["tile-128-1504"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-1504.png"); 
			textures["tile-128-1536"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-1536.png"); 
			textures["tile-128-1568"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-1568.png"); 
			textures["tile-0-1568"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-1568.png"); 
			textures["tile-64-480"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-480.png"); 
			textures["tile-64-512"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-512.png"); 
			textures["tile-64-544"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-544.png"); 
			textures["tile-96-480"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-480.png"); 
			textures["tile-96-512"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-512.png"); 
			textures["tile-96-544"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-544.png"); 
			textures["tile-32-352"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-352.png"); 
			textures["tile-32-736"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-736.png"); 
			textures["tile-64-736"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-736.png"); 
			textures["tile-96-736"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-736.png"); 
			textures["tile-64-960"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-960.png"); 
			textures["tile-96-960"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-960.png"); 
			textures["tile-160-1088"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-1088.png"); 
			textures["tile-32-320"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-320.png"); 
			textures["tile-0-448"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-448.png"); 
			textures["tile-32-384"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-384.png"); 
			textures["tile-32-448"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-448.png"); 
			textures["tile-64-384"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-384.png"); 
			textures["tile-64-416"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-416.png"); 
			textures["tile-96-384"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-384.png"); 
			textures["tile-96-448"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-448.png"); 
			textures["tile-128-448"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-448.png"); 
			textures["tile-160-448"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-448.png"); 
			textures["tile-0-96"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-96.png"); 
			textures["tile-32-96"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-96.png"); 
			textures["tile-64-1472"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-1472.png"); 
			textures["tile-32-1472"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-1472.png"); 
			textures["tile-32-224"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-224.png"); 
			textures["tile-64-1024"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-1024.png"); 
			textures["tile-96-1024"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-1024.png"); 
			textures["tile-64-992"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-992.png"); 
			textures["tile-64-96"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-96.png"); 
			textures["tile-128-1152"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-1152.png"); 
			textures["tile-160-1152"] = PIXI.Texture.fromImage("imgs/tiles/tile-160-1152.png"); 
			textures["tile-0-1472"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-1472.png"); 
			textures["tile-0-1440"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-1440.png"); 
			textures["tile-64-1440"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-1440.png"); 
			textures["tile-32-1440"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-1440.png"); 
			textures["tile-64-1088"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-1088.png"); 
			textures["tile-96-1088"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-1088.png"); 
			textures["tile-0-224"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-224.png"); 
			textures["tile-64-224"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-224.png"); 
			textures["tile-0-192"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-192.png"); 
			textures["tile-32-192"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-192.png"); 
			textures["tile-64-192"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-192.png"); 
			textures["tile-0-896"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-896.png"); 
			textures["tile-0-864"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-864.png"); 
			textures["tile-32-896"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-896.png"); 
			textures["tile-32-928"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-928.png"); 
			textures["tile-96-896"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-896.png"); 
			textures["tile-96-928"] = PIXI.Texture.fromImage("imgs/tiles/tile-96-928.png"); 
			textures["tile-128-864"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-864.png"); 
			textures["tile-128-896"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-896.png"); 
			textures["tile-32-288"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-288.png"); 
			textures["tile-128-1472"] = PIXI.Texture.fromImage("imgs/tiles/tile-128-1472.png"); 
			textures["tile-0-64"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-64.png"); 
			textures["tile-32-64"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-64.png"); 
			textures["tile-64-64"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-64.png"); 
			textures["tile-0-160"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-160.png"); 
			textures["tile-0-1056"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-1056.png"); 
			textures["tile-32-160"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-160.png"); 
			textures["tile-0-1024"] = PIXI.Texture.fromImage("imgs/tiles/tile-0-1024.png"); 
			textures["tile-64-160"] = PIXI.Texture.fromImage("imgs/tiles/tile-64-160.png"); 
			textures["tile-32-1024"] = PIXI.Texture.fromImage("imgs/tiles/tile-32-1024.png"); 

		}
		
		//cria o objeto da camera do jogo
		var  camera2d =
		{
			x : 0,
			y : 0,
			z : 0,
			width  :  width,
			height  :  height
		}
		
		//cria o motor de jogo
		var gameSystem =
		{
		_collision : [], //vetor de colisao
		_updatelist : [], //vetor de objetos de jogo 
		_debugTexts : [],	//vetor de textos de erros
		maxcColDistance : 500, //distancia maxima que pode ocorrer uma colisao
		frameCount : 0,	//contador de frame para calcular fps
		lastSecond : 0, //contem o ultimo segundo do tempo atual
		fps : 60,
		
		//inicia o sistema
		start : function ()
		{
			//carrega as imagens
			loadBasicTextures();
		
			//cria os textos
			this._debugTexts['fps'] = new PIXI.Text("", {font:"50px Arial", fill:"red"});
			this._debugTexts['load'] = new PIXI.Text("Carregando", {font:"24px Arial", fill:"red"});
			this._debugTexts['wsize'] = new PIXI.Text("Width "+ width + " Height "+ height, {font:"20px Arial", fill:"red"});
			this._debugTexts['collision'] = new PIXI.Text("", {font:"20px Arial", fill:"red"});
			this._debugTexts['wsize'].y = 50;
			this._debugTexts['collision'].y = 200;
			this._debugTexts['fps'].depth = 0;
			this._debugTexts['wsize'].depth = 0;
			this._debugTexts['collision'].depth = 0;
			this._debugTexts['load'].depth = 0;
		/*	
			//scene_UI.addChild(this._debugTexts['load']);
			
			scene_UI.addChild(this._debugTexts['fps']);
			scene_UI.addChild(this._debugTexts['collision']);
			scene_UI.addChild(this._debugTexts['wsize']);
		*/
		
		},
		
		//funcao que atualiza todos os objetos e performa funcionalidades no motor de jogo
		update : function ()
		{
			this.frameCount ++;
			
			//simula as teclas a,w,d nas setas do teclado
			if (key.pressed(37))
				key._setPress(ord("A"));
			
			if (key.released(37))
				key._deletePress(ord("A"));
			
			if (key.pressed(38))
				key._setPress(ord("W"));
			
			if (key.released(38))
				key._deletePress(ord("W"));
			
			if (key.pressed(39))
				key._setPress(ord("D"));
			
			if (key.released(39))
				key._deletePress(ord("D"));
			
			
			//atualiza todos os objetos 
			for (var i = 0, l = this._updatelist.length; i<l; i++ )
			{
				this._updatelist[i].update(); 
				this._updatelist[i]._update();
			}
			
			
			currentdate = new Date();
			//calcula fps
			if (this.lastSecond != currentdate.getSeconds())
			{
				this._debugTexts['fps'].text = "FPS: "+this.frameCount;
				this.fps = this.frameCount;
				this.frameCount = 0;
				this.lastSecond = currentdate.getSeconds();
			}
			
			//ajusta a posicao dos graficos do jogo de acordo com a posicao da camera
			world2d.x = (-camera2d.x);
			world2d.y = (-camera2d.y);
			
			//a cada 30 frames organiza profundidade dos graficos
			if (this.frameCount==30)
			{
				world2d.children.sort(function(obj1, obj2) { return  obj2.depth - obj1.depth; });
				scene_UI.children.sort(function(obj1, obj2) { return  obj2.depth - obj1.depth; });
			}
			//printa os graficos na tela
			if (activated2d)
			{
				canvas_UI.render( scene_UI ); //draw 2D view to screen
			}
			//reseta o sistema de input 
			key.cleanSystem();
		},
		
		//adiciona um objeto para os objetos de jogo
		instanceCreate : function (object,x,y,z)
		{
			
			object.gid = this._updatelist.length; //da um id para o objeto 
			this._updatelist[this._updatelist.length] = object; //adiciona objeto no vetor de atualizacao
			//seta x,y,z do objeto
			object.x = x; 
			object.y = y;
			object.z = z;
			//aciona funcao de create do objeto
			object.create();
			//retorna objeto criado
			return object;
		},
		
		//calcula menor distancia entre 2 pontos
		pointDistance : function (x,y,z,x2,y2,z2)
		{
			return (Math.sqrt((Math.pow(x-x2,2))+(Math.pow(y-y2,2))+(Math.pow(z-z2,2))));
		},
		
		//calcula uma colisao 2d ou 3d
		collision3d : function(x,y,z,width,height,depth,x2,y2,z2,width2,height2,depth2)
		{
			if (x>=x2+width2){return false;}
			if (x+width<=x2){return false;}
			if (y>=y2+height2){return false;}
			if (y+height<=y2){return false;}
			if (z>=z2+depth2){return false;}
			if (z+depth<=z2){return false;}
			return true;
		},
		
		//pega uma instancia do tipo obtypearg da lista de objetos
		getInstance : function (obtypearg)
		{
			for (var i = 0, l = this._updatelist.length; i<l; i++ )
			{
				this._updatelist[i].obtype==obtypearg;
				return this._updatelist[i];
			}
			return null;
		},
		
		//checa colisao de um objeto se tivesse na posicao x,y,z com outro objeto do tipo obtype
		checkCollision : function (x,y,z,objectarg, obtype)
		{
			var x1,y2,z1,x2,y2,z2;
			
			//se noa tiver uma lista de colisao do tipo obtype retorna falso
			if (!this._collision[obtype])
			{
				return false;
			}
			
			//roda pela lista de colisao do tipo obtype
			var atual = this._collision[obtype].first;
			while(atual!=null)
			{
				if (atual.dataob==objectarg) // para nao acontecer colisao com o proprio objeto
				{
					atual = atual.next;
					continue;
				}
				
				//Se objetos estiverem muito distantes, colisao nao ocorre
				if (this.pointDistance(x,y,z,atual.dataob.x,atual.dataob.y,atual.dataob.z)>this.maxcColDistance)
				{
					atual = atual.next;
					continue;
				}
					
				//checa cada conjunto de colisao de um objeto com outro objeto	
				for (var i = 0, l = objectarg.cdata.length; i<l; i++ )
				{
				//calcula posicao esperada da colisao, e adiciona offsets de colisao
				x1 = objectarg.cdata[i][0]+x;
				y1 = objectarg.cdata[i][1]+y;
				z1 = objectarg.cdata[i][2]+z;
					
					for (var u = 0, m = atual.dataob.cdata.length; u<m; u++ )
					{
						//calcula posicao x,y,z, com os offsets do conjunto de colisao
						x2 = atual.dataob.cdata[u][0]+atual.dataob.x;
						y2 = atual.dataob.cdata[u][1]+atual.dataob.y;
						z2 = atual.dataob.cdata[u][2]+atual.dataob.z;
						
						//checa colisao
						if (this.collision3d(x1,y1,z1,objectarg.cdata[i][3],objectarg.cdata[i][4],objectarg.cdata[i][5],
							   x2,y2,z2,atual.dataob.cdata[u][3],atual.dataob.cdata[u][4],atual.dataob.cdata[u][5])
							)
						   {
							   //retorna o objeto que colidiu
								return atual.dataob;
						   }
					}
				}	
				atual = atual.next;
			}
			//se nada colidiu
			return false;
		},
		
		
		
		/*
		verifica colisao de um retangulo com um tipo de objeto
		*pam1 = x of box;
		*pam2 = y of box;
		*pam3 = z of box;
		*pam3 = vector of box dimensions [width,height,depth]
		*pam4 = type of object to collide with
		*pam5 = object that is calling, should be filled with "this" if the box should not collide with the calling instance
		*/
		checkBoxCollision : function (x,y,z,coldata, obtype, objectarg)
		{
			var x1,y2,z1,x2,y2,z2;

			if (!this._collision[obtype])
				return false;
			
			x1 = coldata[0]+x;
			y1 = coldata[1]+y;
			z1 = coldata[2]+z;
			
			var atual = this._collision[obtype].first;
			while(atual!=null)
			{
				if (atual.dataob==objectarg) // if we don't want to collide with ourselves,we skip
				{
					atual = atual.next;
					continue;
				}
				//if objects are too far away they probably will not collide
				if (this.pointDistance(x,y,z,atual.dataob.x,atual.dataob.y,atual.dataob.z)>this.maxcColDistance)
					return false;
					
					for (var u = 0, m = atual.dataob.cdata.length; u<m; u++ )
					{
						x2 = atual.dataob.cdata[u][0]+atual.dataob.x;
						y2 = atual.dataob.cdata[u][1]+atual.dataob.y;
						z2 = atual.dataob.cdata[u][2]+atual.dataob.z;
						
						if (this.collision3d(x1,y1,z1,objectarg.cdata[i][3],objectarg.cdata[i][4],objectarg.cdata[i][5],
							   x2,y2,z2,atual.dataob.cdata[u][3],atual.dataob.cdata[u][4],atual.dataob.cdata[u][5])
							)
						   {
								return true;
						   }
					}	
				atual = atual.next;
			}
			return false;
		},
		
		//adiciona um objeto para uma lista de colisao
		addCollision : function (obarg)
		{
		    var atual;
			var obtype = obarg.obtype;
			
			//se a lista de colisao para este tipo de objeto nao existir, cria uma nova
			if (!this._collision[obtype])
			{
				this._collision[obtype] = new List (obarg);
				return true;
			}
			//senao, roda pela lista que ja existe e insere no final
			atual = this._collision[obtype].first;
			while (atual!=null)
			{
				if (atual.next==null)
				{
					atual.next = new Node(atual,obarg);
					this._collision[obtype].last = atual.next;
					atual.next.next=null;
					return true;
				}
				atual=atual.next;
			}
			return false;
		},
		
		
		/*  remove um objeto da sua lista de colisao
			removeCollision
			codes: -1 = no collision list,
		*/
		removeCollision : function (obarg)
		{
			var atual;
			var obtype = obarg.obtype;
			//se nao houver lista de colisao desse objeto, retornar -1
			if (!this._collision[obtype])
			{
				return -1; 
			}
			
			//roda pela lista
			atual = this._collision[obtype].first;
			while (atual!=null)
			{
				if (atual.dataob.gid==obarg.gid) //se o objeto que esta checando for o mesmo que o atual da lista
				{
					if (atual.father==null) //e ele for o primeiro da lista
					{
						if (atual.next==null) // e ele for o unico da lista
						{
							this._collision[obtype] = null; //deleta a lista
							
							return 1;
						}else //atualiza a lista 
						{
							this._collision[obtype].first = atual.next;
							this._collision[obtype].first.father=null;
							if (this._collision[obtype].first.next==null)
							{
								this._collision[obtype].last = this._collision[obtype].first;
							}
							
							return 2;
						}
					}
					
					//se for o ultimo da lista, o penultimo da lista vira o ultimo
					if (this._collision[obtype].last == atual)
					{
						this._collision[obtype].last = atual.father;
					}
					atual.father.next = atual.next; //remove reference of the object from the list
				}
				atual=atual.next; //continua rodando a lista
			}	
		},
		
		//destroi uma instancia do sistema
		destroyInstance : function (obarg)
		{
			world2d.removeChild(obarg.graphic);
			this.removeCollision(obarg);
			delete this._updatelist[obarg.gid];	
			this._updatelist[obarg.gid] = new stub();
		}
		
		};

		
		//END INITIATE SYSTEMS==========================================================================================================================================
		
		
		
		
		
		function player ()
		{
			this.gid = 0;
			this.obtype="c_player";
			this.cdata = [[0,0,0,1,1,1]]; //conjunto de colisao
			this.x=0;
			this.y=0;
			//x do objeto eh composto
			this.bx=0; //x alterado pelo usuario
			this.mx=0; //x da aceleracao
			this.hspeed=0;
			this.z=0;
			this.gravity = 0;
			this.verticalSpeed=0;
			this.graphic = {};
			this.room = {}; 
			this.walkAnimation = []; 
			this.animFrame=0;
			this.mainBack=0;
			this.vidas = 0;
			this.coracoes = [];
			this.stop=0;
			this.invi=0;
			this.mobile=0;
			this.jumpCount=0;
			this.monsterGraphic= {};
			this.monsterAnimation = [];
			this.fogGraphic= {};
			this.fogAnimation = [];
			
			this.create = function ()
			{ 
				if (isMobile.any())
				{
					this.mobile=1;
				}
				
				this.vidas = 4;
				this.cdata = [[3,5,0,26,42,1]];
				
				//adicionar graficos no vetor de andar
				for(var i=0;i<3;i++)
				{
					this.walkAnimation[i] = new PIXI.Sprite(textures[("ghost-"+i)]);
					this.walkAnimation[i].visible = 0;
					this.walkAnimation[i].depth=100;
					world2d.addChild(this.walkAnimation[i]); //adiciona no container o que vai ser printado na tela
				}
				
				for(var i=0;i<5;i++)
				{
					this.monsterAnimation[i] = new PIXI.Sprite(textures[("monster-"+i)]);
					this.monsterAnimation[i].visible = 0;
					this.monsterAnimation[i].depth=100;
					world2d.addChild(this.monsterAnimation[i]);
				}
				
				for(var i=0;i<4;i++)
				{
					this.fogAnimation[i] = new PIXI.Sprite(textures[("fog-"+i)]);
					this.fogAnimation[i].visible = 0;
					this.fogAnimation[i].depth=20;
					world2d.addChild(this.fogAnimation[i]);
				}
				
				for(var i=0;i<5;i++)
				{
					this.coracoes[i] = new PIXI.Sprite(textures["vida"]);
					this.coracoes[i].y = 10;
					this.coracoes[i].depth=0;
					world2d.addChild(this.coracoes[i]);	
				}
				
				//torna a fog visivel
				this.fogGraphic = this.fogAnimation[0];
				this.fogGraphic.visible = 1;
				
				//torna o monstro visivel
				this.monsterGraphic = this.monsterAnimation[0];
				this.monsterGraphic.visible = 1;
				
				//torna o fantasma visivel
				this.graphic = this.walkAnimation[0];
				this.graphic.visible = 1;
					
				//adiciona o objeto na lista de colisao
				gameSystem.addCollision(this);
				
				this.verticalSpeed=0;
				
				this.room = gameSystem.getInstance("c_room");
				this.hspeed = 1;
				
				
				
			};
			
			//atualizar o personagem
			this.update = function ()
			{
				if (this.stop==1)return;
				this.gravity = 15;
				//para de cair se colidir com o chao
				if (gameSystem.checkCollision(this.x,this.y+1,DZ,this,"c_chao") && this.verticalSpeed>0)
				{
					this.gravity = 0;
					this.verticalSpeed = 0;	
				}
				
				
					//se colidir com a vida, adiciona vida, toca musica e destroi a instancia da vida
					var bon = gameSystem.checkCollision(this.x,this.y,DZ,this,"c_vida");
					if (bon && this.vidas < 4)
					{
						sounds ['health'].play();
						this.vidas++;
						gameSystem.destroyInstance(bon);
						
					}
					//se colidir com o speed, adiciona velocidade, toca musica e destroi a instancia do speed
					bon = gameSystem.checkCollision(this.x,this.y,DZ,this,"c_speed");
					if (bon)
					{
						this.hspeed+=1.5;
						if (this.hspeed>5)
							this.hspeed=5;
						gameSystem.destroyInstance(bon);
					}
					
					//se colidir com o slow, adiciona velocidade, toca musica e destroi a instancia do slow
					bon = gameSystem.checkCollision(this.x,this.y,DZ,this,"c_slow");
					
					if (bon)
					{
						this.hspeed-=1.5;
						if (this.hspeed<1)
							this.hspeed=1;
						gameSystem.destroyInstance(bon);
					}
					//se nao tiver invuneravel e colidir com espinho, perde vida, reseta posicao, toca musica, remove espinho e fica invuneravel 
					if (this.invi<=0)
					{
						bon = gameSystem.checkCollision(this.x,this.y,DZ,this,"c_spike");
						if (bon)
						{
							this.vidas--;
							this.y = 0;
							this.mx = camera2d.x+220;
							this.bx = 0;
							this.verticalSpeed = 0;
							gameSystem.removeCollision(bon);
							bon.graphic.visible=0;
							this.invi=60;
							sounds['bate'].play();
						}
					}else
					{
						this.invi--;
					}
				
				//se for computador comando do teclado para controlar o fantasma
				if (this.mobile==0)
				{
					if (key.pressed(ord("W")) && gameSystem.checkCollision(this.x,this.y+1,DZ,this,"c_chao"))
					{
						this.verticalSpeed=-7;
						sounds ['jump'].play();	
					}					
					if (key.released(ord("W")) && this.verticalSpeed<-2)
						this.verticalSpeed=-2;
				}else 
				{
					//se for mobile muda o tipo de controle para funcionar com touch
					if (key.pressed(ord("W")) && gameSystem.checkCollision(this.x,this.y+1,DZ,this,"c_chao"))
					{
						this.verticalSpeed=-10;
						this.jumpCount=1;
					}
					if (key.pressed(ord("W")) && !gameSystem.checkCollision(this.x,this.y+1,DZ,this,"c_chao") && this.y>100 && this.jumpCount<=0)// && this.jumpCount>0
					{
						this.verticalSpeed=-8;
						this.jumpCount=1;
					}
					if (this.jumpCount>0)
						this.jumpCount--;
				}
				
				//se bater no teto, comeca a cair
				if (this.verticalSpeed<0 && gameSystem.checkCollision(this.x,this.y-12,DZ,this,"c_chao"))
					this.verticalSpeed=0;
					
				
				if (key.press(ord("A")))
				{
					this.bx -=2;
				}
				
				if (key.press(ord("D")))
				{
					this.bx +=2;
				}
				
				//se cair no buraco ou ficar para fora da tela, reseta posicao e diminui vidas
				if (this.y>360 || this.x<(camera2d.x-10))
				{
					this.vidas--;
					this.y = 0;
					this.invi=60;
					this.mx = camera2d.x+220;
					this.bx = 0;
					this.verticalSpeed = 0;
				}
			
			};
			
			this._update = function()
			{
				if (this.stop==1)
					return;
				
				//se for atravessar o chao, diminui a velocidade vertical
			    if (gameSystem.checkCollision(this.x,this.y+this.verticalSpeed+2,DZ,this,"c_ground") && this.verticalSpeed>3)
				this.verticalSpeed=this.verticalSpeed/5;
				
				this.y += this.verticalSpeed ; //adiciona velocidade na posicao y
				this.verticalSpeed += this.gravity * (1/gameSystem.fps); //recalcula a velocidade vertical
				//limita a velocidade vertical
				if (this.verticalSpeed>10)this.verticalSpeed=10; 
				
				//incrementa velocidade horizontal se for menor que 5
				if (this.hspeed<5)
				{
					this.hspeed+=0.001;
				}
				this.mx+=this.hspeed;
				camera2d.x += this.hspeed;
				
				this.room.pontos = Math.round(this.mx/8);
				this.room.texts['pontos'].text = "Distance "+ this.room.pontos + " ft";
				
				//se for bater na parede da direita, ele "volta" 
				if (gameSystem.checkCollision(this.x+7,this.y-10,DZ,this,"c_chao"))
				{
					this.mx-=this.hspeed;
					if (key.press(ord("D")))
					{
						this.bx -=2;
					}
				}
				
				//se ele passar camera, posicao volta
				if (this.mx+this.bx>(camera2d.x+450))
					this.bx-=2;
				
				this.x = this.mx+this.bx; //compoe a posicao 
				
				//calcula animacoes do fantasma
				this.animFrame+=0.1;
				if (this.animFrame>3)this.animFrame=0;
				
				//move background
				if (this.room.graphic.x<-480)
					this.mainBack=1;
				if (this.room.graphic2.x<-480)
					this.mainBack=0;
						
						
				if (this.mainBack==0)
				{
					this.room.graphic.x-=this.hspeed*0.1;
					this.room.graphic2.x=this.room.graphic.x+480;
				}else
				{
					this.room.graphic2.x-=this.hspeed*0.1;
					this.room.graphic.x=this.room.graphic2.x+480;
				}
				
				// controle de animacao
				//fantasma
				this.graphic.visible = 0; //apaga o grafico anterior
				this.graphic.alpha = 1-((this.invi%10)/10); //seta transparencia do atual 
				this.graphic = this.walkAnimation[Math.floor(this.animFrame)]; //escolhe o grafico atual
				this.graphic.visible = 1; //deixa o grafico atual visivel
				
				//monstro
				this.monsterGraphic.visible = 0;
				this.monsterGraphic = this.monsterAnimation[Math.floor(this.animFrame*1.5)];
				this.monsterGraphic.visible = 1;
				
				//nevoa
				this.fogGraphic.visible = 0;
				this.fogGraphic = this.fogAnimation[Math.floor(this.animFrame)];
				this.fogGraphic.visible = 1;
				
				
				this.graphic.x = this.x;
				this.graphic.y = this.y;
				
				this.monsterGraphic.x = camera2d.x;
				this.monsterGraphic.y = this.graphic.y;
				
				this.fogGraphic.x = camera2d.x;
				
				camera2d.y = this.y - (160/2);
				
				
				//ajustar x,y da camera
				if (camera2d.y < 0)camera2d.y=0;
				if (camera2d.x < 0)camera2d.x=0;
				if (camera2d.y+height > this.room.room_height) camera2d.y = (this.room.room_height-height);
				
				
				//animacao dos coracoes
				for(var i=0;i<5;i++)
				{
					this.coracoes[i].x = camera2d.x+10+ i*32;
					if (i>this.vidas)
					{
						this.coracoes[i].visible = 0;
					}
					else
					{
						this.coracoes[i].visible = 1;
					}
					
				}
				
			}
		
		}
		
		//cria objeto vazio
		function stub ()
		{
			this.gid = -5;
			this.obtype="c_";
			this.create = function ()
			{
				
			};
			this.update = function ()
			{
			
			};
			
			this._update = function()
			{
			
			}
		
		}
				
		function chao ()
		{
			this.gid = 0;
			this.obtype="c_chao";
			
			this.cdata = [];
			this.x=0;
			this.y=0;
			this.z=0;
			this.graphic = {};
			this.count = 0;
			
			this.create = function ()
			{
				this.cdata = [[0,0,0,32,32,1]];
				gameSystem.addCollision(this);
			};
			this.update = function ()
			{
			
			};
			
			this._update = function()
			{ //seta a posicao do objeto de acordo com a posicao da fase que ele faz parte
				this.x = this.basex + this.father.x;
				this.y = this.basey;
				this.graphic.x = this.x;
				this.graphic.y = this.y;
			}
		
		}
		
		function bvida ()
		{
			this.gid = 0;
			this.obtype="c_vida";
			
			this.cdata = [];
			this.x=0;
			this.y=0;
			this.z=0;
			this.graphic = {};
			this.count = 0;
			this.turner=0;
			this.ny=0;
			this.by=0;
			this.create = function ()
			{
				this.by=this.y;
			
				this.cdata = [[0,0,0,30,30,1]];
				this.graphic = new PIXI.Sprite(textures["coracao"]);
				this.graphic.depth = 1;
				world2d.addChild( this.graphic );	
				gameSystem.addCollision(this);
				
			};
			this.update = function ()
			{
				//controla movimentacao do coracao
				if (this.turner==0)
				{
					this.ny-=0.1;
				}else
				{
					this.ny+=0.1;
				}
				
				if (this.ny>5)
				{
					this.turner=0;
				}
				if (this.ny<-5)
				{
					this.turner=1;
				}
				
				//se estiver muito para tras da camera, ele se deleta
				if (this.x < (camera2d.x-100))
					gameSystem.destroyInstance(this);
			};
			
			this._update = function()
			{
				this.graphic.x = this.x;
				this.graphic.y = this.y;
				this.y = this.by+this.ny;
			}
		
		}
		
		
		function bslow ()
		{
			this.gid = 0;
			this.obtype="c_slow";
			
			this.cdata = [];
			this.x=0;
			this.y=0;
			this.z=0;
			this.graphic = {};
			this.count = 0;
			this.turner=0;
			this.ny=0;
			this.by=0;
			this.create = function ()
			{
				this.by=this.y;
			
				this.cdata = [[0,0,0,30,30,1]];
				this.graphic = new PIXI.Sprite(textures["setae"]);
				this.graphic.depth = 1;
				world2d.addChild( this.graphic );	
				gameSystem.addCollision(this);
				
			};
			this.update = function ()
			{
				if (this.turner==0)
				{
					this.ny-=0.1;
				}else
				{
					this.ny+=0.1;
				}
				
				if (this.ny>5)
				{
					this.turner=0;
				}
				if (this.ny<-5)
				{
					this.turner=1;
				}
				
				if (this.x < (camera2d.x-100))
					gameSystem.destroyInstance(this);
			};
			
			this._update = function()
			{
				this.graphic.x = this.x;
				this.graphic.y = this.y;
				this.y = this.by+this.ny;
			}
		
		}
		
		function bspeed ()
		{
			this.gid = 0;
			this.obtype="c_speed";
			
			this.cdata = [];
			this.x=0;
			this.y=0;
			this.z=0;
			this.graphic = {};
			this.count = 0;
			this.turner=0;
			this.ny=0;
			this.by=0;
			this.create = function ()
			{
				this.by=this.y;
				this.cdata = [[0,0,0,30,30,1]];
				this.graphic = new PIXI.Sprite(textures["setad"]);
				this.graphic.depth = 1;
				world2d.addChild( this.graphic );	
				gameSystem.addCollision(this);
				
			};
			this.update = function ()
			{
				if (this.turner==0)
				{
					this.ny-=0.1;
				}else
				{
					this.ny+=0.1;
				}
				
				if (this.ny>5)
				{
					this.turner=0;
				}
				if (this.ny<-5)
				{
					this.turner=1;
				}
				
				if (this.x < (camera2d.x-100))
					gameSystem.destroyInstance(this);
			};
			
			this._update = function()
			{
				this.graphic.x = this.x;
				this.graphic.y = this.y;
				this.y = this.by+this.ny;
			}
		
		}
		
		function bonus ()
		{
			this.gid = 0;
			this.obtype="c_bonus";
			
			this.cdata = [];
			this.x=0;
			this.y=0;
			this.z=0;
			this.graphic = {};
			this.count = 0;
			this.counter=0;
			this.create = function ()
			{
				this.cdata = [[0,0,0,32,32,1]];			
			};
			this.update = function ()
			{

			};
			
			//cria os bonus
			this._update = function()
			{
				this.x = this.basex + this.father.x;
				this.y = this.basey;
				this.graphic.x = this.x;
				this.graphic.y = this.y;
				
				//escolhe aleatoriamente o bonus
				if (this.father.respawn>1 && this.counter<=0)
				{
					var rand = Math.random()*100;
					rand = rand%100;
					rand = Math.floor(rand);
					if (rand<10)
					{
						rand = Math.random()*10;
						rand = rand%3;
						rand = Math.floor(rand);
						switch(rand)
						{
							case 0:
							{
								gameSystem.instanceCreate(new bvida(), this.x,this.y,DZ);
								break;
							}
							case 1:
							{
								gameSystem.instanceCreate(new bslow(), this.x,this.y,DZ);
								break;
							}
							case 2:
							{
								gameSystem.instanceCreate(new bspeed(), this.x,this.y,DZ);
								break;
							}
						}
					}
					this.counter=4;
				}
				
				if (this.counter>0)
					this.counter--;
			}
		
		}
		
		
		function espinho ()
		{
			this.gid = 0;
			this.obtype="c_spike";
			
			this.cdata = [];
			this.x=0;
			this.y=0;
			this.z=0;
			this.graphic = {};
			this.count = 0;
			this.counter = 0;
			this.rotatedir=0;
			this.create = function ()
			{
				this.cdata = [[-14,-14,0,26,26,1]];
				
				//this.graphic.anchor.y=16;
				
				this.graphic = new PIXI.Sprite(textures["spike"]);
				this.graphic.depth = 1;
				this.graphic.visible = false;
				world2d.addChild(this.graphic);	
				this.graphic.anchor.x=0.5;
				this.graphic.anchor.y=0.5;
				
			};
			this.update = function ()
			{
				if (this.rotatedir==0)
				{
					this.graphic.rotation+=0.01;
				}else
				{
					this.graphic.rotation-=0.01;
				}
				if (this.graphic.rotation>0.2)
					this.rotatedir=1;
				if (this.graphic.rotation<-0.2)
					this.rotatedir=0;
				
				if (this.father.respawn>0 && this.counter<=0)
				{
					var rand = Math.random()*100;
					rand = rand%100;
					rand = Math.floor(rand);
					if (rand<20)
					{
						this.graphic.tint = Math.random() * 0xFFFFFF; //muda a cor aleatoriamente
						this.graphic.visible=1;
						gameSystem.addCollision(this);
					}
					this.counter=4;
				}
				
				if (this.x<camera2d.x-100 && this.father.active==0)
				{
					this.graphic.visible=0;
					gameSystem.removeCollision(this);
				}
				
				//nao permitir criar mais de um ao mesmo tempo, em um frame
				if (this.counter>0)
					this.counter--;
			};
			
			//seta x,y, baseado na fase que esta 
			this._update = function()
			{
				this.x = this.basex + this.father.x;
				this.y = this.basey;
				this.graphic.x = this.x;
				this.graphic.y = this.y;
			}
		
		}

		
		//adiciona um grafico para uma fase
		function addTile(container, texturename,x,y,depth)
		{
			var sp;
			sp = new PIXI.Sprite(textures[texturename]);
			sp.x = x;
			sp.y = y;
			sp.depth = depth;
			container.addChild( sp );
		}
		
		//adiciona um objeto pra uma fase
		function addScenarioObject(object,father,x,y)
		{
			var a = gameSystem.instanceCreate(object,x,y,DZ);
			a.father = father;
			a.basex = x;
			a.basey = y;
		}
		
		var mountMap = [];
		mountMap[0] = function mountMap1(father)
		{
			addScenarioObject(new chao(), father, 0, 288);
			addScenarioObject(new chao(), father, 32, 288);
			addScenarioObject(new chao(), father, 64, 288);
			addScenarioObject(new chao(), father, 128, 288);
			addScenarioObject(new chao(), father, 96, 288);
			addScenarioObject(new chao(), father, 160, 288);
			addScenarioObject(new chao(), father, 192, 288);
			addScenarioObject(new chao(), father, 224, 288);
			addScenarioObject(new chao(), father, 256, 288);
			addScenarioObject(new chao(), father, 288, 288);
			addScenarioObject(new chao(), father, 320, 288);
			addScenarioObject(new chao(), father, 480, 288);
			addScenarioObject(new chao(), father, 512, 288);
			addScenarioObject(new chao(), father, 640, 256);
			addScenarioObject(new chao(), father, 672, 256);
			addScenarioObject(new chao(), father, 704, 256);
			addScenarioObject(new chao(), father, 864, 192);
			addScenarioObject(new chao(), father, 896, 192);
			addScenarioObject(new chao(), father, 448, 288);
			addScenarioObject(new chao(), father, 640, 288);
			addScenarioObject(new chao(), father, 704, 288);
			addScenarioObject(new chao(), father, 832, 192);
			addScenarioObject(new chao(), father, 832, 224);
			addScenarioObject(new chao(), father, 832, 256);
			addScenarioObject(new chao(), father, 832, 288);
			addScenarioObject(new chao(), father, 896, 224);
			addScenarioObject(new chao(), father, 896, 256);
			addScenarioObject(new chao(), father, 896, 288);
			addScenarioObject(new bonus(), father, 352, 160);
			addScenarioObject(new bonus(), father, 96, 160);
			addScenarioObject(new bonus(), father, 224, 64);
			addScenarioObject(new bonus(), father, 576, 192);
			addScenarioObject(new bonus(), father, 768, 128);

			addTile(father.graphic,"tile-128-576", 108, 235,51);
			addTile(father.graphic,"tile-128-608", 108, 267,51);
			addTile(father.graphic,"tile-160-576", 140, 235,51);
			addTile(father.graphic,"tile-160-608", 140, 267,51);
			addTile(father.graphic,"tile-128-576", 207, 233,51);
			addTile(father.graphic,"tile-128-608", 207, 265,51);
			addTile(father.graphic,"tile-160-576", 239, 233,51);
			addTile(father.graphic,"tile-160-608", 239, 265,51);
			addTile(father.graphic,"tile-128-576", 301, 231,51);
			addTile(father.graphic,"tile-128-608", 301, 263,51);
			addTile(father.graphic,"tile-160-576", 333, 231,51);
			addTile(father.graphic,"tile-160-608", 333, 263,51);
			addTile(father.graphic,"tile-128-576", 433, 240,51);
			addTile(father.graphic,"tile-128-608", 433, 272,51);
			addTile(father.graphic,"tile-160-576", 465, 240,51);
			addTile(father.graphic,"tile-160-608", 465, 272,51);
			addTile(father.graphic,"tile-128-576", 499, 238,51);
			addTile(father.graphic,"tile-128-608", 499, 270,51);
			addTile(father.graphic,"tile-160-576", 531, 238,51);
			addTile(father.graphic,"tile-160-608", 531, 270,51);
			addTile(father.graphic,"tile-128-576", 656, 207,51);
			addTile(father.graphic,"tile-128-608", 656, 239,51);
			addTile(father.graphic,"tile-160-576", 688, 207,51);
			addTile(father.graphic,"tile-160-608", 688, 239,51);
			addTile(father.graphic,"tile-64-1344", 0, 256,51);
			addTile(father.graphic,"tile-64-1344", 32, 253,51);
			addTile(father.graphic,"tile-64-1344", 64, 256,51);
			addTile(father.graphic,"tile-64-1344", 96, 256,51);
			addTile(father.graphic,"tile-64-1344", 128, 256,51);
			addTile(father.graphic,"tile-64-1344", 160, 256,51);
			addTile(father.graphic,"tile-64-1344", 192, 256,51);
			addTile(father.graphic,"tile-64-1344", 224, 256,51);
			addTile(father.graphic,"tile-64-1344", 256, 256,51);
			addTile(father.graphic,"tile-64-1344", 288, 256,51);
			addTile(father.graphic,"tile-64-1344", 320, 252,51);
			addTile(father.graphic,"tile-32-1792", 143, 219,51);
			addTile(father.graphic,"tile-32-1824", 143, 251,51);
			addTile(father.graphic,"tile-64-1792", 175, 219,51);
			addTile(father.graphic,"tile-64-1824", 175, 251,51);
			addTile(father.graphic,"tile-96-1792", 207, 219,51);
			addTile(father.graphic,"tile-96-1824", 207, 251,51);
			addTile(father.graphic,"tile-128-1792", 239, 219,51);
			addTile(father.graphic,"tile-128-1824", 239, 251,51);
			addTile(father.graphic,"tile-160-1792", 271, 219,51);
			addTile(father.graphic,"tile-160-1824", 271, 251,51);
			addTile(father.graphic,"tile-64-1760", 175, 188,51);
			addTile(father.graphic,"tile-96-1760", 207, 188,51);
			addTile(father.graphic,"tile-128-1760", 239, 188,51);
			addTile(father.graphic,"tile-160-1760", 271, 188,51);
			addTile(father.graphic,"tile-64-1664", 174, 157,51);
			addTile(father.graphic,"tile-96-1664", 206, 157,51);
			addTile(father.graphic,"tile-128-1664", 238, 157,51);
			addTile(father.graphic,"tile-160-1664", 270, 157,51);
			addTile(father.graphic,"tile-64-1632", 175, 125,51);
			addTile(father.graphic,"tile-96-1600", 206, 94,51);
			addTile(father.graphic,"tile-128-1600", 238, 94,51);
			addTile(father.graphic,"tile-96-1632", 206, 125,51);
			addTile(father.graphic,"tile-128-1632", 238, 125,51);
			addTile(father.graphic,"tile-160-1632", 270, 125,51);
			addTile(father.graphic,"tile-0-1632", 113, 125,51);
			addTile(father.graphic,"tile-0-1664", 113, 157,51);
			addTile(father.graphic,"tile-32-1632", 145, 125,51);
			addTile(father.graphic,"tile-32-1664", 145, 157,51);
			addTile(father.graphic,"tile-64-2112", 301, 125,51);
			addTile(father.graphic,"tile-64-2144", 301, 157,51);
			addTile(father.graphic,"tile-96-2112", 333, 125,51);
			addTile(father.graphic,"tile-96-2144", 333, 157,51);
			addTile(father.graphic,"tile-0-1760", 895, 154,51);
			addTile(father.graphic,"tile-160-1280", 832, 160,51);
			addTile(father.graphic,"tile-160-1216", 864, 160,51);
			addTile(father.graphic,"tile-160-1184", 864, 128,51);
			addTile(father.graphic,"tile-0-32", 0, 288,50);
			addTile(father.graphic,"tile-32-32", 32, 288,50);
			addTile(father.graphic,"tile-32-32", 64, 288,50);
			addTile(father.graphic,"tile-32-32", 96, 288,50);
			addTile(father.graphic,"tile-32-32", 128, 288,50);
			addTile(father.graphic,"tile-32-32", 160, 288,50);
			addTile(father.graphic,"tile-32-32", 192, 288,50);
			addTile(father.graphic,"tile-32-32", 256, 288,50);
			addTile(father.graphic,"tile-32-32", 224, 288,50);
			addTile(father.graphic,"tile-32-32", 288, 288,50);
			addTile(father.graphic,"tile-64-32", 320, 288,50);
			addTile(father.graphic,"tile-32-0", 288, 256,50);
			addTile(father.graphic,"tile-32-0", 32, 256,50);
			addTile(father.graphic,"tile-32-0", 64, 256,50);
			addTile(father.graphic,"tile-32-0", 96, 256,50);
			addTile(father.graphic,"tile-32-0", 128, 256,50);
			addTile(father.graphic,"tile-32-0", 160, 256,50);
			addTile(father.graphic,"tile-32-0", 192, 256,50);
			addTile(father.graphic,"tile-32-0", 224, 256,50);
			addTile(father.graphic,"tile-32-0", 256, 256,50);
			addTile(father.graphic,"tile-0-0", 0, 256,50);
			addTile(father.graphic,"tile-64-0", 320, 256,50);
			addTile(father.graphic,"tile-0-32", 448, 288,50);
			addTile(father.graphic,"tile-32-32", 480, 288,50);
			addTile(father.graphic,"tile-64-32", 512, 288,50);
			addTile(father.graphic,"tile-32-0", 480, 256,50);
			addTile(father.graphic,"tile-0-0", 448, 256,50);
			addTile(father.graphic,"tile-64-0", 512, 256,50);
			addTile(father.graphic,"tile-0-32", 640, 256,50);
			addTile(father.graphic,"tile-64-32", 704, 256,50);
			addTile(father.graphic,"tile-32-32", 672, 256,50);
			addTile(father.graphic,"tile-32-0", 640, 224,50);
			addTile(father.graphic,"tile-64-0", 704, 224,50);
			addTile(father.graphic,"tile-32-0", 672, 224,50);
			addTile(father.graphic,"tile-0-960", 640, 288,50);
			addTile(father.graphic,"tile-32-960", 704, 288,50);
			addTile(father.graphic,"tile-128-1120", 672, 288,50);
			addTile(father.graphic,"tile-128-1120", 864, 224,50);
			addTile(father.graphic,"tile-128-1120", 864, 288,50);
			addTile(father.graphic,"tile-0-1088", 832, 288,50);
			addTile(father.graphic,"tile-32-1088", 896, 288,50);
			addTile(father.graphic,"tile-32-1088", 896, 256,50);
			addTile(father.graphic,"tile-32-1088", 896, 224,50);
			addTile(father.graphic,"tile-0-1088", 832, 256,50);
			addTile(father.graphic,"tile-0-1088", 832, 224,50);
			addTile(father.graphic,"tile-160-1120", 864, 256,50);
			addTile(father.graphic,"tile-0-32", 832, 192,50);
			addTile(father.graphic,"tile-64-32", 896, 192,50);
			addTile(father.graphic,"tile-32-32", 864, 192,50);
			addTile(father.graphic,"tile-0-0", 832, 160,50);
			addTile(father.graphic,"tile-64-0", 896, 160,50);
			addTile(father.graphic,"tile-32-0", 864, 160,50);
			addTile(father.graphic,"tile-64-1504", 323, 116,50);
			addTile(father.graphic,"tile-64-1536", 323, 148,50);
			addTile(father.graphic,"tile-64-1568", 323, 180,50);
			addTile(father.graphic,"tile-96-1504", 355, 116,50);
			addTile(father.graphic,"tile-96-1536", 355, 148,50);
			addTile(father.graphic,"tile-96-1568", 355, 180,50);
			addTile(father.graphic,"tile-128-1504", 387, 116,50);
			addTile(father.graphic,"tile-128-1536", 387, 148,50);
			addTile(father.graphic,"tile-128-1568", 387, 180,50);
			addTile(father.graphic,"tile-64-1504", 68, 108,50);
			addTile(father.graphic,"tile-64-1536", 68, 140,50);
			addTile(father.graphic,"tile-64-1568", 68, 172,50);
			addTile(father.graphic,"tile-96-1504", 100, 108,50);
			addTile(father.graphic,"tile-96-1536", 100, 140,50);
			addTile(father.graphic,"tile-96-1568", 100, 172,50);
			addTile(father.graphic,"tile-128-1504", 132, 108,50);
			addTile(father.graphic,"tile-128-1536", 132, 140,50);
			addTile(father.graphic,"tile-128-1568", 132, 172,50);
			addTile(father.graphic,"tile-96-1568", 225, 110,50);
			addTile(father.graphic,"tile-128-1568", 254, 111,50);
			addTile(father.graphic,"tile-128-1568", 266, 106,50);
			addTile(father.graphic,"tile-128-1568", 278, 99,50);
			addTile(father.graphic,"tile-128-1568", 287, 93,50);
			addTile(father.graphic,"tile-128-1536", 291, 69,50);
			addTile(father.graphic,"tile-128-1536", 289, 62,50);
			addTile(father.graphic,"tile-128-1536", 286, 58,50);
			addTile(father.graphic,"tile-128-1536", 282, 51,50);
			addTile(father.graphic,"tile-128-1504", 278, 29,50);
			addTile(father.graphic,"tile-128-1504", 268, 22,50);
			addTile(father.graphic,"tile-96-1504", 243, 21,50);
			addTile(father.graphic,"tile-96-1504", 227, 21,50);
			addTile(father.graphic,"tile-0-1568", 224, 64,50);
			addTile(father.graphic,"tile-0-1568", 256, 64,50);
			addTile(father.graphic,"tile-0-1568", 223, 87,50);
			addTile(father.graphic,"tile-0-1568", 256, 79,50);
			addTile(father.graphic,"tile-0-1568", 254, 53,50);
			addTile(father.graphic,"tile-0-1568", 225, 52,50);
			addTile(father.graphic,"tile-96-1504", 206, 22,50);
			addTile(father.graphic,"tile-0-1568", 220, 86,50);
			addTile(father.graphic,"tile-0-1568", 194, 65,50);
			addTile(father.graphic,"tile-0-1568", 194, 52,50);
			addTile(father.graphic,"tile-64-1504", 175, 23,50);
			addTile(father.graphic,"tile-64-1504", 169, 31,50);
			addTile(father.graphic,"tile-64-1504", 163, 36,50);
			addTile(father.graphic,"tile-64-1536", 163, 62,50);
			addTile(father.graphic,"tile-64-1568", 165, 90,50);
			addTile(father.graphic,"tile-64-1568", 170, 99,50);
			addTile(father.graphic,"tile-64-1568", 176, 107,50);
			addTile(father.graphic,"tile-64-1568", 185, 111,50);
			addTile(father.graphic,"tile-96-1568", 215, 109,50);
			addTile(father.graphic,"tile-0-1568", 197, 85,50);
			addTile(father.graphic,"tile-0-1568", 96, 128,50);
			addTile(father.graphic,"tile-0-1568", 352, 160,50);
			addTile(father.graphic,"tile-0-1568", 359, 145,50);
			addTile(father.graphic,"tile-0-1568", 98, 144,50);
			addTile(father.graphic,"tile-0-1568", 244, 85,50);


		};
		
		mountMap[1] = function mountMap2(father)
		{
			addScenarioObject(new chao(), father, 0, 288);
			addScenarioObject(new chao(), father, 32, 288);
			addScenarioObject(new chao(), father, 64, 288);
			addScenarioObject(new chao(), father, 96, 288);
			addScenarioObject(new chao(), father, 128, 288);
			addScenarioObject(new chao(), father, 160, 288);
			addScenarioObject(new chao(), father, 192, 288);
			addScenarioObject(new chao(), father, 224, 288);
			addScenarioObject(new chao(), father, 256, 288);
			addScenarioObject(new chao(), father, 320, 288);
			addScenarioObject(new chao(), father, 288, 288);
			addScenarioObject(new chao(), father, 352, 288);
			addScenarioObject(new chao(), father, 384, 288);
			addScenarioObject(new chao(), father, 416, 288);
			addScenarioObject(new chao(), father, 448, 288);
			addScenarioObject(new chao(), father, 480, 288);
			addScenarioObject(new chao(), father, 512, 288);
			addScenarioObject(new chao(), father, 544, 288);
			addScenarioObject(new chao(), father, 576, 288);
			addScenarioObject(new chao(), father, 608, 288);
			addScenarioObject(new chao(), father, 640, 288);
			addScenarioObject(new chao(), father, 800, 224);
			addScenarioObject(new chao(), father, 832, 224);
			addScenarioObject(new chao(), father, 768, 224);
			addScenarioObject(new chao(), father, 768, 256);
			addScenarioObject(new chao(), father, 768, 288);
			addScenarioObject(new chao(), father, 832, 256);
			addScenarioObject(new chao(), father, 832, 288);
			addScenarioObject(new espinho(), father, 128, 256);
			addScenarioObject(new espinho(), father, 160, 256);
			addScenarioObject(new espinho(), father, 224, 256);
			addScenarioObject(new espinho(), father, 320, 256);
			addScenarioObject(new espinho(), father, 352, 256);
			addScenarioObject(new espinho(), father, 448, 256);
			addScenarioObject(new espinho(), father, 416, 256);
			addScenarioObject(new espinho(), father, 320, 160);
			addScenarioObject(new espinho(), father, 416, 128);
			addScenarioObject(new espinho(), father, 480, 160);
			addScenarioObject(new espinho(), father, 576, 96);
			addScenarioObject(new espinho(), father, 128, 96);
			addScenarioObject(new espinho(), father, 640, 256);
			addScenarioObject(new espinho(), father, 96, 160);
			addScenarioObject(new espinho(), father, 256, 96);
			addScenarioObject(new espinho(), father, 832, 192);
			addScenarioObject(new bonus(), father, 288, 160);
			addScenarioObject(new bonus(), father, 448, 160);
			addScenarioObject(new bonus(), father, 832, 96);
			addScenarioObject(new bonus(), father, 608, 256);

			addTile(father.graphic,"tile-64-480", 365, 221,1000001);
			addTile(father.graphic,"tile-64-512", 365, 253,1000001);
			addTile(father.graphic,"tile-64-544", 365, 285,1000001);
			addTile(father.graphic,"tile-96-480", 397, 221,1000001);
			addTile(father.graphic,"tile-96-512", 397, 253,1000001);
			addTile(father.graphic,"tile-96-544", 397, 285,1000001);
			addTile(father.graphic,"tile-64-480", 409, 206,1000001);
			addTile(father.graphic,"tile-64-512", 409, 238,1000001);
			addTile(father.graphic,"tile-64-544", 409, 270,1000001);
			addTile(father.graphic,"tile-96-480", 441, 206,1000001);
			addTile(father.graphic,"tile-96-512", 441, 238,1000001);
			addTile(father.graphic,"tile-96-544", 441, 270,1000001);
			addTile(father.graphic,"tile-64-480", 473, 210,1000001);
			addTile(father.graphic,"tile-64-512", 473, 242,1000001);
			addTile(father.graphic,"tile-64-544", 473, 274,1000001);
			addTile(father.graphic,"tile-96-480", 505, 210,1000001);
			addTile(father.graphic,"tile-96-512", 505, 242,1000001);
			addTile(father.graphic,"tile-96-544", 505, 274,1000001);
			addTile(father.graphic,"tile-64-480", 512, 224,1000001);
			addTile(father.graphic,"tile-64-512", 512, 256,1000001);
			addTile(father.graphic,"tile-64-544", 512, 288,1000001);
			addTile(father.graphic,"tile-96-480", 544, 224,1000001);
			addTile(father.graphic,"tile-96-512", 544, 256,1000001);
			addTile(father.graphic,"tile-96-544", 544, 288,1000001);
			addTile(father.graphic,"tile-64-480", 552, 215,1000001);
			addTile(father.graphic,"tile-64-512", 552, 247,1000001);
			addTile(father.graphic,"tile-64-544", 552, 279,1000001);
			addTile(father.graphic,"tile-96-480", 584, 215,1000001);
			addTile(father.graphic,"tile-96-512", 584, 247,1000001);
			addTile(father.graphic,"tile-96-544", 584, 279,1000001);
			addTile(father.graphic,"tile-64-480", 607, 220,1000001);
			addTile(father.graphic,"tile-64-512", 607, 252,1000001);
			addTile(father.graphic,"tile-64-544", 607, 284,1000001);
			addTile(father.graphic,"tile-96-480", 639, 220,1000001);
			addTile(father.graphic,"tile-96-512", 639, 252,1000001);
			addTile(father.graphic,"tile-96-544", 639, 284,1000001);
			addTile(father.graphic,"tile-64-480", 442, 187,1000001);
			addTile(father.graphic,"tile-64-512", 442, 219,1000001);
			addTile(father.graphic,"tile-64-544", 442, 251,1000001);
			addTile(father.graphic,"tile-96-480", 474, 187,1000001);
			addTile(father.graphic,"tile-96-512", 474, 219,1000001);
			addTile(father.graphic,"tile-96-544", 474, 251,1000001);
			addTile(father.graphic,"tile-64-480", 513, 187,1000001);
			addTile(father.graphic,"tile-64-512", 513, 219,1000001);
			addTile(father.graphic,"tile-64-544", 513, 251,1000001);
			addTile(father.graphic,"tile-96-480", 545, 187,1000001);
			addTile(father.graphic,"tile-96-512", 545, 219,1000001);
			addTile(father.graphic,"tile-96-544", 545, 251,1000001);
			addTile(father.graphic,"tile-64-480", 584, 195,1000001);
			addTile(father.graphic,"tile-64-512", 584, 227,1000001);
			addTile(father.graphic,"tile-64-544", 584, 259,1000001);
			addTile(father.graphic,"tile-96-480", 616, 195,1000001);
			addTile(father.graphic,"tile-96-512", 616, 227,1000001);
			addTile(father.graphic,"tile-96-544", 616, 259,1000001);
			addTile(father.graphic,"tile-0-352", 768, 224,1000001);
			addTile(father.graphic,"tile-32-352", 800, 224,1000001);
			addTile(father.graphic,"tile-64-352", 832, 224,1000001);
			addTile(father.graphic,"tile-32-736", 768, 288,1000001);
			addTile(father.graphic,"tile-64-736", 800, 288,1000001);
			addTile(father.graphic,"tile-96-736", 832, 288,1000001);
			addTile(father.graphic,"tile-64-960", 768, 256,1000001);
			addTile(father.graphic,"tile-96-960", 832, 256,1000001);
			addTile(father.graphic,"tile-160-1088", 800, 256,1000001);
			addTile(father.graphic,"tile-0-320", 768, 192,1000001);
			addTile(father.graphic,"tile-32-320", 800, 192,1000001);
			addTile(father.graphic,"tile-64-320", 832, 192,1000001);
			addTile(father.graphic,"tile-0-32", 0, 288,1000000);
			addTile(father.graphic,"tile-32-32", 32, 288,1000000);
			addTile(father.graphic,"tile-32-32", 64, 288,1000000);
			addTile(father.graphic,"tile-0-384", 64, 224,1000000);
			addTile(father.graphic,"tile-0-416", 64, 256,1000000);
			addTile(father.graphic,"tile-0-448", 64, 288,1000000);
			addTile(father.graphic,"tile-32-384", 96, 224,1000000);
			addTile(father.graphic,"tile-32-416", 96, 256,1000000);
			addTile(father.graphic,"tile-32-448", 96, 288,1000000);
			addTile(father.graphic,"tile-64-384", 128, 224,1000000);
			addTile(father.graphic,"tile-64-416", 128, 256,1000000);
			addTile(father.graphic,"tile-64-448", 128, 288,1000000);
			addTile(father.graphic,"tile-96-384", 160, 224,1000000);
			addTile(father.graphic,"tile-96-416", 160, 256,1000000);
			addTile(father.graphic,"tile-96-448", 160, 288,1000000);
			addTile(father.graphic,"tile-64-384", 192, 224,1000000);
			addTile(father.graphic,"tile-64-416", 192, 256,1000000);
			addTile(father.graphic,"tile-64-448", 192, 288,1000000);
			addTile(father.graphic,"tile-96-384", 224, 224,1000000);
			addTile(father.graphic,"tile-96-416", 224, 256,1000000);
			addTile(father.graphic,"tile-96-448", 224, 288,1000000);
			addTile(father.graphic,"tile-64-384", 256, 224,1000000);
			addTile(father.graphic,"tile-64-416", 256, 256,1000000);
			addTile(father.graphic,"tile-64-448", 256, 288,1000000);
			addTile(father.graphic,"tile-96-384", 288, 224,1000000);
			addTile(father.graphic,"tile-96-416", 288, 256,1000000);
			addTile(father.graphic,"tile-96-448", 288, 288,1000000);
			addTile(father.graphic,"tile-128-384", 320, 224,1000000);
			addTile(father.graphic,"tile-128-416", 320, 256,1000000);
			addTile(father.graphic,"tile-128-448", 320, 288,1000000);
			addTile(father.graphic,"tile-160-384", 352, 224,1000000);
			addTile(father.graphic,"tile-160-416", 352, 256,1000000);
			addTile(father.graphic,"tile-160-448", 352, 288,1000000);
			addTile(father.graphic,"tile-0-352", 352, 288,1000000);
			addTile(father.graphic,"tile-0-320", 352, 256,1000000);
			addTile(father.graphic,"tile-32-352", 384, 288,1000000);
			addTile(father.graphic,"tile-32-352", 416, 288,1000000);
			addTile(father.graphic,"tile-32-352", 448, 288,1000000);
			addTile(father.graphic,"tile-32-352", 480, 288,1000000);
			addTile(father.graphic,"tile-32-352", 512, 288,1000000);
			addTile(father.graphic,"tile-32-320", 384, 256,1000000);
			addTile(father.graphic,"tile-32-320", 416, 256,1000000);
			addTile(father.graphic,"tile-32-320", 448, 256,1000000);
			addTile(father.graphic,"tile-32-320", 480, 256,1000000);
			addTile(father.graphic,"tile-32-320", 512, 256,1000000);
			addTile(father.graphic,"tile-32-320", 576, 256,1000000);
			addTile(father.graphic,"tile-32-320", 544, 256,1000000);
			addTile(father.graphic,"tile-32-320", 608, 256,1000000);
			addTile(father.graphic,"tile-32-352", 608, 288,1000000);
			addTile(father.graphic,"tile-32-352", 576, 288,1000000);
			addTile(father.graphic,"tile-32-352", 544, 288,1000000);
			addTile(father.graphic,"tile-64-352", 640, 288,1000000);
			addTile(father.graphic,"tile-64-320", 640, 256,1000000);

		};
		
		mountMap[2] = function mountMap3(father)
		{
			addScenarioObject(new chao(), father, 0, 288);
			addScenarioObject(new chao(), father, 32, 288);
			addScenarioObject(new chao(), father, 128, 288);
			addScenarioObject(new chao(), father, 160, 288);
			addScenarioObject(new chao(), father, 192, 288);
			addScenarioObject(new chao(), father, 224, 256);
			addScenarioObject(new chao(), father, 288, 256);
			addScenarioObject(new chao(), father, 256, 256);
			addScenarioObject(new chao(), father, 320, 256);
			addScenarioObject(new chao(), father, 512, 256);
			addScenarioObject(new chao(), father, 544, 192);
			addScenarioObject(new chao(), father, 576, 192);
			addScenarioObject(new chao(), father, 608, 192);
			addScenarioObject(new chao(), father, 640, 192);
			addScenarioObject(new chao(), father, 704, 192);
			addScenarioObject(new chao(), father, 672, 192);
			addScenarioObject(new chao(), father, 736, 256);
			addScenarioObject(new chao(), father, 864, 256);
			addScenarioObject(new chao(), father, 896, 256);
			addScenarioObject(new chao(), father, 928, 256);
			addScenarioObject(new chao(), father, 864, 288);
			addScenarioObject(new chao(), father, 928, 288);
			addScenarioObject(new chao(), father, 736, 288);
			addScenarioObject(new chao(), father, 544, 224);
			addScenarioObject(new chao(), father, 224, 288);
			addScenarioObject(new chao(), father, 352, 256);
			addScenarioObject(new chao(), father, 384, 256);
			addScenarioObject(new chao(), father, 416, 256);
			addScenarioObject(new chao(), father, 448, 256);
			addScenarioObject(new chao(), father, 480, 256);
			addScenarioObject(new chao(), father, 704, 224);
			addScenarioObject(new espinho(), father, 320, 224);
			addScenarioObject(new espinho(), father, 416, 224);
			addScenarioObject(new espinho(), father, 512, 224);
			addScenarioObject(new espinho(), father, 384, 128);
			addScenarioObject(new espinho(), father, 256, 128);
			addScenarioObject(new espinho(), father, 704, 160);
			addScenarioObject(new espinho(), father, 864, 64);
			addScenarioObject(new espinho(), father, 704, 32);
			addScenarioObject(new espinho(), father, 640, 160);
			addScenarioObject(new espinho(), father, 864, 224);
			addScenarioObject(new bonus(), father, 192, 256);
			addScenarioObject(new bonus(), father, 608, 64);
			addScenarioObject(new bonus(), father, 416, 128);

			addTile(father.graphic,"tile-0-96", 0, 288,1000000);
			addTile(father.graphic,"tile-32-96", 32, 288,1000000);
			addTile(father.graphic,"tile-32-96", 128, 288,1000000);
			addTile(father.graphic,"tile-32-96", 160, 288,1000000);
			addTile(father.graphic,"tile-64-1472", 64, 288,1000000);
			addTile(father.graphic,"tile-32-1472", 96, 288,1000000);
			addTile(father.graphic,"tile-0-352", 224, 256,1000000);
			addTile(father.graphic,"tile-32-352", 256, 256,1000000);
			addTile(father.graphic,"tile-32-352", 288, 256,1000000);
			addTile(father.graphic,"tile-32-224", 192, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 544, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 576, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 608, 288,1000000);
			addTile(father.graphic,"tile-64-1024", 544, 224,1000000);
			addTile(father.graphic,"tile-96-1024", 736, 288,1000000);
			addTile(father.graphic,"tile-96-1024", 704, 224,1000000);
			addTile(father.graphic,"tile-160-1088", 544, 256,1000000);
			addTile(father.graphic,"tile-160-1088", 576, 256,1000000);
			addTile(father.graphic,"tile-160-1088", 704, 256,1000000);
			addTile(father.graphic,"tile-160-1088", 704, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 672, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 640, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 640, 256,1000000);
			addTile(father.graphic,"tile-160-1088", 576, 224,1000000);
			addTile(father.graphic,"tile-160-1088", 640, 224,1000000);
			addTile(father.graphic,"tile-0-352", 544, 192,1000000);
			addTile(father.graphic,"tile-32-352", 576, 192,1000000);
			addTile(father.graphic,"tile-32-352", 608, 192,1000000);
			addTile(father.graphic,"tile-32-352", 640, 192,1000000);
			addTile(father.graphic,"tile-32-352", 672, 192,1000000);
			addTile(father.graphic,"tile-64-352", 704, 192,1000000);
			addTile(father.graphic,"tile-64-352", 736, 256,1000000);
			addTile(father.graphic,"tile-64-992", 864, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 896, 288,1000000);
			addTile(father.graphic,"tile-64-96", 928, 256,1000000);
			addTile(father.graphic,"tile-0-96", 864, 256,1000000);
			addTile(father.graphic,"tile-32-96", 896, 256,1000000);
			addTile(father.graphic,"tile-96-960", 928, 288,1000000);
			addTile(father.graphic,"tile-32-352", 320, 256,1000000);
			addTile(father.graphic,"tile-32-352", 512, 256,1000000);
			addTile(father.graphic,"tile-32-352", 352, 256,1000000);
			addTile(father.graphic,"tile-32-352", 384, 256,1000000);
			addTile(father.graphic,"tile-32-352", 416, 256,1000000);
			addTile(father.graphic,"tile-32-352", 448, 256,1000000);
			addTile(father.graphic,"tile-32-352", 480, 256,1000000);
			addTile(father.graphic,"tile-64-992", 224, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 256, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 288, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 320, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 384, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 416, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 448, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 480, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 512, 288,1000000);
			addTile(father.graphic,"tile-128-1120", 352, 288,1000000);
			addTile(father.graphic,"tile-128-1152", 608, 256,1000000);
			addTile(father.graphic,"tile-128-1120", 608, 224,1000000);
			addTile(father.graphic,"tile-160-1120", 672, 224,1000000);
			addTile(father.graphic,"tile-160-1152", 672, 256,1000000);


		};
		
		mountMap[3] = function mountMap4(father)
		{
			addScenarioObject(new chao(), father, 0, 256);
			addScenarioObject(new chao(), father, 64, 256);
			addScenarioObject(new chao(), father, 32, 256);
			addScenarioObject(new chao(), father, 192, 224);
			addScenarioObject(new chao(), father, 224, 224);
			addScenarioObject(new chao(), father, 256, 224);
			addScenarioObject(new chao(), father, 480, 96);
			addScenarioObject(new chao(), father, 384, 160);
			addScenarioObject(new chao(), father, 576, 192);
			addScenarioObject(new chao(), father, 608, 64);
			addScenarioObject(new chao(), father, 704, 96);
			addScenarioObject(new chao(), father, 736, 256);
			addScenarioObject(new chao(), father, 768, 256);
			addScenarioObject(new chao(), father, 192, 256);
			addScenarioObject(new chao(), father, 256, 256);
			addScenarioObject(new chao(), father, 864, 192);
			addScenarioObject(new chao(), father, 928, 288);
			addScenarioObject(new espinho(), father, 64, 224);
			addScenarioObject(new espinho(), father, 192, 96);
			addScenarioObject(new espinho(), father, 64, 128);
			addScenarioObject(new bonus(), father, 288, 128);
			addScenarioObject(new bonus(), father, 704, 192);
			addScenarioObject(new bonus(), father, 704, 32);
			addScenarioObject(new bonus(), father, 544, 0);
			addScenarioObject(new bonus(), father, 832, 96);

			addTile(father.graphic,"tile-0-1472", 0, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 64, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 128, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 160, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 192, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 256, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 288, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 320, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 352, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 416, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 448, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 480, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 544, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 576, 288,1000000);
			addTile(father.graphic,"tile-0-1440", 96, 256,1000000);
			addTile(father.graphic,"tile-0-1440", 128, 256,1000000);
			addTile(father.graphic,"tile-0-1440", 160, 256,1000000);
			addTile(father.graphic,"tile-0-1440", 256, 256,1000000);
			addTile(father.graphic,"tile-0-1440", 320, 256,1000000);
			addTile(father.graphic,"tile-0-1440", 288, 256,1000000);
			addTile(father.graphic,"tile-0-1440", 384, 256,1000000);
			addTile(father.graphic,"tile-0-1440", 352, 256,1000000);
			addTile(father.graphic,"tile-0-1440", 576, 256,1000000);
			addTile(father.graphic,"tile-0-1440", 544, 256,1000000);
			addTile(father.graphic,"tile-0-1440", 512, 256,1000000);
			addTile(father.graphic,"tile-0-1440", 480, 256,1000000);
			addTile(father.graphic,"tile-0-1440", 448, 256,1000000);
			addTile(father.graphic,"tile-0-1440", 416, 256,1000000);
			addTile(father.graphic,"tile-32-1472", 224, 288,1000000);
			addTile(father.graphic,"tile-32-1472", 96, 288,1000000);
			addTile(father.graphic,"tile-32-1472", 384, 288,1000000);
			addTile(father.graphic,"tile-32-1472", 512, 288,1000000);
			addTile(father.graphic,"tile-32-1472", 32, 288,1000000);
			addTile(father.graphic,"tile-0-352", 192, 224,1000000);
			addTile(father.graphic,"tile-32-352", 224, 224,1000000);
			addTile(father.graphic,"tile-64-352", 256, 224,1000000);
			addTile(father.graphic,"tile-0-320", 192, 192,1000000);
			addTile(father.graphic,"tile-32-320", 224, 192,1000000);
			addTile(father.graphic,"tile-64-320", 256, 192,1000000);
			addTile(father.graphic,"tile-64-1440", 193, 256,1000000);
			addTile(father.graphic,"tile-64-1440", 192, 256,1000000);
			addTile(father.graphic,"tile-0-352", 384, 160,1000000);
			addTile(father.graphic,"tile-0-320", 384, 128,1000000);
			addTile(father.graphic,"tile-0-352", 480, 96,1000000);
			addTile(father.graphic,"tile-0-320", 480, 64,1000000);
			addTile(father.graphic,"tile-0-352", 576, 192,1000000);
			addTile(father.graphic,"tile-0-320", 576, 160,1000000);
			addTile(father.graphic,"tile-0-1472", 608, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 640, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 672, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 704, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 736, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 768, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 800, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 832, 288,1000000);
			addTile(father.graphic,"tile-32-1440", 608, 256,1000000);
			addTile(father.graphic,"tile-32-1440", 640, 256,1000000);
			addTile(father.graphic,"tile-32-1440", 672, 256,1000000);
			addTile(father.graphic,"tile-32-1440", 704, 256,1000000);
			addTile(father.graphic,"tile-32-1440", 800, 256,1000000);
			addTile(father.graphic,"tile-32-1440", 832, 256,1000000);
			addTile(father.graphic,"tile-0-1472", 864, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 896, 288,1000000);
			addTile(father.graphic,"tile-0-1440", 864, 256,1000000);
			addTile(father.graphic,"tile-0-1440", 896, 256,1000000);
			addTile(father.graphic,"tile-0-352", 704, 96,1000000);
			addTile(father.graphic,"tile-0-352", 736, 256,1000000);
			addTile(father.graphic,"tile-0-352", 864, 192,1000000);
			addTile(father.graphic,"tile-0-320", 704, 64,1000000);
			addTile(father.graphic,"tile-0-320", 864, 160,1000000);
			addTile(father.graphic,"tile-32-352", 928, 288,1000000);
			addTile(father.graphic,"tile-32-320", 928, 256,1000000);
			addTile(father.graphic,"tile-160-1088", 224, 256,1000000);
			addTile(father.graphic,"tile-64-1088", 192, 256,1000000);
			addTile(father.graphic,"tile-96-1088", 256, 256,1000000);
			addTile(father.graphic,"tile-32-1440", 195, 257,1000000);
			addTile(father.graphic,"tile-32-1440", 224, 256,1000000);
			addTile(father.graphic,"tile-32-1440", 256, 256,1000000);
			addTile(father.graphic,"tile-0-384", 64, 192,1000000);
			addTile(father.graphic,"tile-0-416", 64, 224,1000000);
			addTile(father.graphic,"tile-32-384", 96, 192,1000000);
			addTile(father.graphic,"tile-0-224", 0, 256,1000000);
			addTile(father.graphic,"tile-32-224", 32, 256,1000000);
			addTile(father.graphic,"tile-64-224", 64, 256,1000000);
			addTile(father.graphic,"tile-0-192", 0, 224,1000000);
			addTile(father.graphic,"tile-32-192", 32, 224,1000000);
			addTile(father.graphic,"tile-64-192", 64, 224,1000000);
			addTile(father.graphic,"tile-64-352", 768, 256,1000000);
			addTile(father.graphic,"tile-64-320", 768, 224,1000000);
			addTile(father.graphic,"tile-0-320", 736, 224,1000000);
			addTile(father.graphic,"tile-0-352", 608, 64,1000000);
			addTile(father.graphic,"tile-0-320", 608, 32,1000000);
			addTile(father.graphic,"tile-0-1440", 0, 256,900000);
			addTile(father.graphic,"tile-0-1440", 32, 256,900000);
			addTile(father.graphic,"tile-0-1440", 64, 256,900000);


		};
		
		mountMap[4] = function mountMap5(father)
		{
			addScenarioObject(new chao(), father, 288, 256);
			addScenarioObject(new chao(), father, 320, 256);
			addScenarioObject(new chao(), father, 352, 256);
			addScenarioObject(new chao(), father, 384, 256);
			addScenarioObject(new chao(), father, 416, 288);
			addScenarioObject(new chao(), father, 448, 288);
			addScenarioObject(new chao(), father, 480, 288);
			addScenarioObject(new chao(), father, 0, 288);
			addScenarioObject(new chao(), father, 32, 288);
			addScenarioObject(new chao(), father, 64, 256);
			addScenarioObject(new chao(), father, 96, 256);
			addScenarioObject(new chao(), father, 128, 224);
			addScenarioObject(new chao(), father, 256, 224);
			addScenarioObject(new chao(), father, 608, 288);
			addScenarioObject(new chao(), father, 640, 288);
			addScenarioObject(new chao(), father, 704, 256);
			addScenarioObject(new chao(), father, 736, 256);
			addScenarioObject(new chao(), father, 864, 256);
			addScenarioObject(new chao(), father, 896, 256);
			addScenarioObject(new chao(), father, 928, 256);
			addScenarioObject(new chao(), father, 128, 256);
			addScenarioObject(new chao(), father, 128, 288);
			addScenarioObject(new chao(), father, 224, 224);
			addScenarioObject(new chao(), father, 224, 256);
			addScenarioObject(new chao(), father, 224, 288);
			addScenarioObject(new chao(), father, 576, 288);
			addScenarioObject(new chao(), father, 672, 256);
			addScenarioObject(new chao(), father, 832, 256);
			addScenarioObject(new espinho(), father, 320, 224);
			addScenarioObject(new espinho(), father, 96, 224);
			addScenarioObject(new espinho(), father, 256, 96);
			addScenarioObject(new espinho(), father, 448, 192);
			addScenarioObject(new chao(), father, 672, 288);
			addScenarioObject(new chao(), father, 736, 288);
			addScenarioObject(new espinho(), father, 640, 256);
			addScenarioObject(new espinho(), father, 736, 224);
			addScenarioObject(new espinho(), father, 736, 96);
			addScenarioObject(new espinho(), father, 896, 160);
			addScenarioObject(new bonus(), father, 416, 256);
			addScenarioObject(new bonus(), father, 576, 160);
			addScenarioObject(new bonus(), father, 736, 128);
			addScenarioObject(new bonus(), father, 864, 160);

			addTile(father.graphic,"tile-0-768", 928, 256,990000);
			addTile(father.graphic,"tile-96-288", 832, 256,990000);
			addTile(father.graphic,"tile-128-288", 864, 256,990000);
			addTile(father.graphic,"tile-160-288", 896, 256,990000);
			addTile(father.graphic,"tile-160-1088", 256, 288,990000);
			addTile(father.graphic,"tile-160-1088", 288, 288,990000);
			addTile(father.graphic,"tile-160-1088", 320, 288,990000);
			addTile(father.graphic,"tile-160-1088", 352, 288,990000);
			addTile(father.graphic,"tile-160-1088", 384, 288,990000);
			addTile(father.graphic,"tile-160-1088", 64, 288,990000);
			addTile(father.graphic,"tile-160-1088", 96, 288,990000);
			addTile(father.graphic,"tile-160-1088", 128, 256,990000);
			addTile(father.graphic,"tile-160-1088", 128, 288,990000);
			addTile(father.graphic,"tile-0-896", 128, 192,990000);
			addTile(father.graphic,"tile-0-864", 128, 160,990000);
			addTile(father.graphic,"tile-32-896", 160, 192,990000);
			addTile(father.graphic,"tile-32-928", 160, 224,990000);
			addTile(father.graphic,"tile-96-896", 192, 192,990000);
			addTile(father.graphic,"tile-96-928", 192, 224,990000);
			addTile(father.graphic,"tile-128-864", 224, 160,990000);
			addTile(father.graphic,"tile-128-896", 224, 192,990000);
			addTile(father.graphic,"tile-0-1440", 160, 224,990000);
			addTile(father.graphic,"tile-0-1472", 160, 256,990000);
			addTile(father.graphic,"tile-32-1440", 192, 224,990000);
			addTile(father.graphic,"tile-32-1472", 192, 256,990000);
			addTile(father.graphic,"tile-32-288", 256, 256,990000);
			addTile(father.graphic,"tile-0-1472", 224, 288,990000);
			addTile(father.graphic,"tile-0-1472", 224, 256,990000);
			addTile(father.graphic,"tile-0-288", 672, 256,990000);
			addTile(father.graphic,"tile-32-288", 704, 256,990000);
			addTile(father.graphic,"tile-64-288", 736, 256,990000);
			addTile(father.graphic,"tile-0-288", 64, 256,900000);
			addTile(father.graphic,"tile-0-288", 0, 288,900000);
			addTile(father.graphic,"tile-32-288", 32, 288,900000);
			addTile(father.graphic,"tile-32-288", 96, 256,900000);
			addTile(father.graphic,"tile-32-288", 288, 256,900000);
			addTile(father.graphic,"tile-32-288", 320, 256,900000);
			addTile(father.graphic,"tile-32-288", 352, 256,900000);
			addTile(father.graphic,"tile-32-288", 416, 288,900000);
			addTile(father.graphic,"tile-32-288", 448, 288,900000);
			addTile(father.graphic,"tile-32-288", 608, 288,900000);
			addTile(father.graphic,"tile-32-288", 128, 224,900000);
			addTile(father.graphic,"tile-0-288", 224, 224,900000);
			addTile(father.graphic,"tile-64-288", 256, 224,900000);
			addTile(father.graphic,"tile-64-288", 384, 256,900000);
			addTile(father.graphic,"tile-64-288", 480, 288,900000);
			addTile(father.graphic,"tile-64-288", 640, 288,900000);
			addTile(father.graphic,"tile-0-288", 576, 288,900000);
			addTile(father.graphic,"tile-0-960", 224, 256,900000);
			addTile(father.graphic,"tile-0-992", 224, 288,900000);
			addTile(father.graphic,"tile-160-288", 256, 256,900000);
			addTile(father.graphic,"tile-32-256", 32, 256,900000);
			addTile(father.graphic,"tile-32-256", 96, 224,900000);
			addTile(father.graphic,"tile-32-256", 288, 224,900000);
			addTile(father.graphic,"tile-32-256", 320, 224,900000);
			addTile(father.graphic,"tile-32-256", 352, 224,900000);
			addTile(father.graphic,"tile-32-256", 416, 256,900000);
			addTile(father.graphic,"tile-32-256", 448, 256,900000);
			addTile(father.graphic,"tile-32-256", 608, 256,900000);
			addTile(father.graphic,"tile-64-256", 256, 192,900000);
			addTile(father.graphic,"tile-64-256", 384, 224,900000);
			addTile(father.graphic,"tile-64-256", 480, 256,900000);
			addTile(father.graphic,"tile-64-256", 640, 256,900000);
			addTile(father.graphic,"tile-32-256", 704, 224,900000);
			addTile(father.graphic,"tile-32-256", 864, 224,900000);
			addTile(father.graphic,"tile-32-256", 896, 224,900000);
			addTile(father.graphic,"tile-64-256", 928, 224,900000);
			addTile(father.graphic,"tile-32-256", 0, 256,900000);
			addTile(father.graphic,"tile-32-256", 64, 224,900000);
			addTile(father.graphic,"tile-32-256", 224, 192,900000);
			addTile(father.graphic,"tile-32-256", 128, 192,900000);
			addTile(father.graphic,"tile-32-256", 832, 224,900000);
			addTile(father.graphic,"tile-32-256", 672, 224,900000);
			addTile(father.graphic,"tile-32-256", 576, 256,900000);
			addTile(father.graphic,"tile-128-1472", 192, 288,900000);
			addTile(father.graphic,"tile-128-1472", 160, 288,900000);
			addTile(father.graphic,"tile-64-256", 736, 224,900000);
			addTile(father.graphic,"tile-32-960", 736, 288,900000);
			addTile(father.graphic,"tile-160-1088", 704, 288,900000);
			addTile(father.graphic,"tile-0-1088", 672, 288,900000);


		};
		
		mountMap[5] = function mountMap6(father)
		{
			addScenarioObject(new chao(), father, 416, 224);
			addScenarioObject(new chao(), father, 480, 224);
			addScenarioObject(new chao(), father, 448, 224);
			addScenarioObject(new chao(), father, 512, 224);
			addScenarioObject(new chao(), father, 544, 224);
			addScenarioObject(new chao(), father, 576, 224);
			addScenarioObject(new chao(), father, 672, 256);
			addScenarioObject(new chao(), father, 704, 256);
			addScenarioObject(new chao(), father, 736, 256);
			addScenarioObject(new chao(), father, 896, 224);
			addScenarioObject(new chao(), father, 864, 224);
			addScenarioObject(new chao(), father, 928, 224);
			addScenarioObject(new chao(), father, 0, 288);
			addScenarioObject(new chao(), father, 32, 288);
			addScenarioObject(new chao(), father, 64, 224);
			addScenarioObject(new chao(), father, 64, 256);
			addScenarioObject(new chao(), father, 96, 224);
			addScenarioObject(new chao(), father, 128, 224);
			addScenarioObject(new chao(), father, 160, 160);
			addScenarioObject(new chao(), father, 160, 192);
			addScenarioObject(new chao(), father, 192, 160);
			addScenarioObject(new chao(), father, 224, 160);
			addScenarioObject(new chao(), father, 256, 160);
			addScenarioObject(new chao(), father, 288, 96);
			addScenarioObject(new chao(), father, 288, 128);
			addScenarioObject(new chao(), father, 320, 96);
			addScenarioObject(new chao(), father, 352, 96);
			addScenarioObject(new chao(), father, 384, 96);
			addScenarioObject(new chao(), father, 384, 128);
			addScenarioObject(new chao(), father, 384, 160);
			addScenarioObject(new chao(), father, 384, 192);
			addScenarioObject(new espinho(), father, 512, 192);
			addScenarioObject(new espinho(), father, 736, 224);
			addScenarioObject(new espinho(), father, 704, 96);
			addScenarioObject(new espinho(), father, 32, 256);
			addScenarioObject(new espinho(), father, 928, 192);
			addScenarioObject(new espinho(), father, 896, 96);
			addScenarioObject(new bonus(), father, 96, 96);
			addScenarioObject(new bonus(), father, 320, 0);
			addScenarioObject(new bonus(), father, 448, 192);
			addScenarioObject(new bonus(), father, 896, 128);

			addTile(father.graphic,"tile-64-256", 512, 192,1000000);
			addTile(father.graphic,"tile-64-256", 544, 192,1000000);
			addTile(father.graphic,"tile-64-256", 576, 192,1000000);
			addTile(father.graphic,"tile-64-256", 672, 224,1000000);
			addTile(father.graphic,"tile-64-256", 704, 224,1000000);
			addTile(father.graphic,"tile-64-256", 864, 192,1000000);
			addTile(father.graphic,"tile-64-256", 928, 192,1000000);
			addTile(father.graphic,"tile-64-256", 896, 192,1000000);
			addTile(father.graphic,"tile-64-256", 736, 224,1000000);
			addTile(father.graphic,"tile-160-1152", 64, 288,1000000);
			addTile(father.graphic,"tile-160-1152", 96, 256,1000000);
			addTile(father.graphic,"tile-160-1152", 192, 256,1000000);
			addTile(father.graphic,"tile-160-1152", 256, 224,1000000);
			addTile(father.graphic,"tile-160-1152", 320, 160,1000000);
			addTile(father.graphic,"tile-160-1152", 320, 224,1000000);
			addTile(father.graphic,"tile-160-1152", 256, 288,1000000);
			addTile(father.graphic,"tile-160-1152", 384, 288,1000000);
			addTile(father.graphic,"tile-160-1152", 448, 256,1000000);
			addTile(father.graphic,"tile-160-1120", 320, 288,1000000);
			addTile(father.graphic,"tile-160-1120", 288, 256,1000000);
			addTile(father.graphic,"tile-160-1120", 192, 224,1000000);
			addTile(father.graphic,"tile-160-1120", 160, 256,1000000);
			addTile(father.graphic,"tile-160-1120", 160, 288,1000000);
			addTile(father.graphic,"tile-160-1120", 224, 256,1000000);
			addTile(father.graphic,"tile-160-1120", 352, 192,1000000);
			addTile(father.graphic,"tile-128-1120", 96, 288,1000000);
			addTile(father.graphic,"tile-128-1120", 128, 256,1000000);
			addTile(father.graphic,"tile-128-1120", 128, 288,1000000);
			addTile(father.graphic,"tile-128-1120", 160, 224,1000000);
			addTile(father.graphic,"tile-128-1120", 288, 192,1000000);
			addTile(father.graphic,"tile-128-1120", 288, 224,1000000);
			addTile(father.graphic,"tile-128-1120", 256, 256,1000000);
			addTile(father.graphic,"tile-128-1120", 288, 288,1000000);
			addTile(father.graphic,"tile-128-1120", 320, 256,1000000);
			addTile(father.graphic,"tile-128-1120", 352, 224,1000000);
			addTile(father.graphic,"tile-128-1120", 352, 256,1000000);
			addTile(father.graphic,"tile-160-1120", 352, 128,1000000);
			addTile(father.graphic,"tile-160-1120", 320, 128,1000000);
			addTile(father.graphic,"tile-160-1088", 288, 160,1000000);
			addTile(father.graphic,"tile-160-1088", 320, 192,1000000);
			addTile(father.graphic,"tile-160-1088", 352, 160,1000000);
			addTile(father.graphic,"tile-160-1088", 192, 192,1000000);
			addTile(father.graphic,"tile-160-1088", 192, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 224, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 352, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 384, 256,1000000);
			addTile(father.graphic,"tile-160-1088", 416, 256,1000000);
			addTile(father.graphic,"tile-160-1088", 416, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 448, 288,1000000);
			addTile(father.graphic,"tile-0-64", 0, 256,1000000);
			addTile(father.graphic,"tile-32-64", 32, 256,1000000);
			addTile(father.graphic,"tile-32-64", 96, 192,1000000);
			addTile(father.graphic,"tile-32-64", 128, 192,1000000);
			addTile(father.graphic,"tile-0-64", 64, 192,1000000);
			addTile(father.graphic,"tile-0-64", 160, 128,1000000);
			addTile(father.graphic,"tile-32-64", 192, 128,1000000);
			addTile(father.graphic,"tile-32-64", 256, 128,1000000);
			addTile(father.graphic,"tile-0-64", 288, 64,1000000);
			addTile(father.graphic,"tile-32-64", 320, 64,1000000);
			addTile(father.graphic,"tile-32-64", 352, 64,1000000);
			addTile(father.graphic,"tile-64-64", 384, 64,1000000);
			addTile(father.graphic,"tile-32-64", 448, 192,1000000);
			addTile(father.graphic,"tile-32-64", 416, 192,1000000);
			addTile(father.graphic,"tile-64-64", 480, 192,1000000);
			addTile(father.graphic,"tile-32-0", 224, 128,1000000);
			addTile(father.graphic,"tile-160-1120", 224, 192,1000000);
			addTile(father.graphic,"tile-160-1152", 224, 224,1000000);
			addTile(father.graphic,"tile-160-1088", 256, 192,1000000);
			addTile(father.graphic,"tile-32-32", 0, 288,900000);
			addTile(father.graphic,"tile-32-32", 32, 288,900000);
			addTile(father.graphic,"tile-32-32", 96, 224,900000);
			addTile(father.graphic,"tile-32-32", 128, 224,900000);
			addTile(father.graphic,"tile-32-32", 192, 160,900000);
			addTile(father.graphic,"tile-32-32", 256, 160,900000);
			addTile(father.graphic,"tile-32-32", 320, 96,900000);
			addTile(father.graphic,"tile-32-32", 352, 96,900000);
			addTile(father.graphic,"tile-32-32", 416, 224,900000);
			addTile(father.graphic,"tile-32-32", 448, 224,900000);
			addTile(father.graphic,"tile-64-32", 384, 96,900000);
			addTile(father.graphic,"tile-0-32", 288, 96,900000);
			addTile(father.graphic,"tile-0-32", 64, 224,900000);
			addTile(father.graphic,"tile-0-960", 64, 256,900000);
			addTile(father.graphic,"tile-0-960", 160, 192,900000);
			addTile(father.graphic,"tile-0-960", 288, 128,900000);
			addTile(father.graphic,"tile-32-960", 384, 128,900000);
			addTile(father.graphic,"tile-32-960", 384, 160,900000);
			addTile(father.graphic,"tile-32-960", 384, 192,900000);
			addTile(father.graphic,"tile-32-960", 480, 256,900000);
			addTile(father.graphic,"tile-32-960", 480, 288,900000);
			addTile(father.graphic,"tile-160-1088", 384, 224,900000);
			addTile(father.graphic,"tile-0-160", 160, 160,900000);
			addTile(father.graphic,"tile-64-32", 480, 224,900000);
			addTile(father.graphic,"tile-32-32", 224, 160,900000);


		};
		mountMap[6] = function mountMap7(father)
		{
			addScenarioObject(new chao(), father, 32, 256);
			addScenarioObject(new chao(), father, 96, 192);
			addScenarioObject(new chao(), father, 128, 192);
			addScenarioObject(new chao(), father, 160, 192);
			addScenarioObject(new chao(), father, 192, 192);
			addScenarioObject(new chao(), father, 224, 192);
			addScenarioObject(new chao(), father, 256, 192);
			addScenarioObject(new chao(), father, 288, 192);
			addScenarioObject(new chao(), father, 320, 192);
			addScenarioObject(new chao(), father, 352, 192);
			addScenarioObject(new chao(), father, 384, 192);
			addScenarioObject(new chao(), father, 416, 192);
			addScenarioObject(new chao(), father, 448, 192);
			addScenarioObject(new chao(), father, 448, 224);
			addScenarioObject(new chao(), father, 480, 256);
			addScenarioObject(new chao(), father, 576, 224);
			addScenarioObject(new chao(), father, 736, 288);
			addScenarioObject(new chao(), father, 768, 288);
			addScenarioObject(new chao(), father, 800, 288);
			addScenarioObject(new chao(), father, 896, 224);
			addScenarioObject(new chao(), father, 928, 224);
			addScenarioObject(new chao(), father, 480, 288);
			addScenarioObject(new chao(), father, 64, 192);
			addScenarioObject(new chao(), father, 64, 224);
			addScenarioObject(new chao(), father, 0, 256);
			addScenarioObject(new chao(), father, 0, 288);
			addScenarioObject(new chao(), father, 544, 224);
			addScenarioObject(new chao(), father, 704, 288);
			addScenarioObject(new chao(), father, 864, 224);
			addScenarioObject(new bonus(), father, 32, 224);
			addScenarioObject(new bonus(), father, 480, 224);
			addScenarioObject(new espinho(), father, 160, 160);
			addScenarioObject(new espinho(), father, 192, 160);
			addScenarioObject(new espinho(), father, 320, 160);
			addScenarioObject(new espinho(), father, 288, 160);
			addScenarioObject(new espinho(), father, 352, 96);
			addScenarioObject(new espinho(), father, 224, 64);
			addScenarioObject(new espinho(), father, 448, 64);
			addScenarioObject(new espinho(), father, 768, 256);
			addScenarioObject(new espinho(), father, 928, 192);
			addScenarioObject(new bonus(), father, 768, 160);
			addScenarioObject(new bonus(), father, 896, 128);

			addTile(father.graphic,"tile-128-1472", 128, 256,1000001);
			addTile(father.graphic,"tile-128-1472", 128, 288,1000001);
			addTile(father.graphic,"tile-128-1472", 384, 256,1000001);
			addTile(father.graphic,"tile-128-1472", 384, 288,1000001);
			addTile(father.graphic,"tile-32-0", 128, 160,1000001);
			addTile(father.graphic,"tile-32-0", 384, 160,1000001);
			addTile(father.graphic,"tile-0-416", 128, 160,1000000);
			addTile(father.graphic,"tile-32-416", 160, 160,1000000);
			addTile(father.graphic,"tile-64-416", 192, 160,1000000);
			addTile(father.graphic,"tile-96-416", 224, 160,1000000);
			addTile(father.graphic,"tile-96-416", 256, 160,1000000);
			addTile(father.graphic,"tile-96-416", 288, 160,1000000);
			addTile(father.graphic,"tile-96-416", 320, 160,1000000);
			addTile(father.graphic,"tile-128-416", 352, 160,1000000);
			addTile(father.graphic,"tile-160-416", 384, 160,1000000);
			addTile(father.graphic,"tile-160-384", 384, 128,1000000);
			addTile(father.graphic,"tile-0-384", 128, 128,1000000);
			addTile(father.graphic,"tile-32-448", 160, 192,1000000);
			addTile(father.graphic,"tile-64-448", 192, 192,1000000);
			addTile(father.graphic,"tile-96-448", 224, 192,1000000);
			addTile(father.graphic,"tile-96-448", 272, 192,1000000);
			addTile(father.graphic,"tile-96-448", 304, 192,1000000);
			addTile(father.graphic,"tile-96-448", 256, 192,1000000);
			addTile(father.graphic,"tile-128-448", 352, 192,1000000);
			addTile(father.graphic,"tile-128-448", 336, 192,1000000);
			addTile(father.graphic,"tile-64-1440", 352, 224,1000000);
			addTile(father.graphic,"tile-64-1440", 336, 224,1000000);
			addTile(father.graphic,"tile-64-1440", 320, 224,1000000);
			addTile(father.graphic,"tile-64-1440", 304, 224,1000000);
			addTile(father.graphic,"tile-64-1440", 288, 224,1000000);
			addTile(father.graphic,"tile-64-1440", 240, 224,1000000);
			addTile(father.graphic,"tile-64-1440", 272, 224,1000000);
			addTile(father.graphic,"tile-64-1440", 224, 224,1000000);
			addTile(father.graphic,"tile-64-1440", 208, 224,1000000);
			addTile(father.graphic,"tile-64-1440", 192, 224,1000000);
			addTile(father.graphic,"tile-64-1440", 160, 224,1000000);
			addTile(father.graphic,"tile-32-32", 736, 288,1000000);
			addTile(father.graphic,"tile-32-32", 768, 288,1000000);
			addTile(father.graphic,"tile-64-32", 800, 288,1000000);
			addTile(father.graphic,"tile-0-288", 544, 224,1000000);
			addTile(father.graphic,"tile-64-288", 576, 224,1000000);
			addTile(father.graphic,"tile-0-288", 864, 224,1000000);
			addTile(father.graphic,"tile-32-288", 896, 224,1000000);
			addTile(father.graphic,"tile-64-288", 928, 224,1000000);
			addTile(father.graphic,"tile-0-32", 704, 288,1000000);
			addTile(father.graphic,"tile-32-32", 32, 256,1000000);
			addTile(father.graphic,"tile-0-1056", 64, 224,1000000);
			addTile(father.graphic,"tile-32-160", 96, 192,1000000);
			addTile(father.graphic,"tile-32-160", 416, 192,1000000);
			addTile(father.graphic,"tile-32-992", 448, 224,1000000);
			addTile(father.graphic,"tile-32-992", 480, 288,1000000);
			addTile(father.graphic,"tile-0-992", 384, 256,1000000);
			addTile(father.graphic,"tile-0-1024", 384, 288,1000000);
			addTile(father.graphic,"tile-0-1024", 384, 224,1000000);
			addTile(father.graphic,"tile-0-160", 384, 192,1000000);
			addTile(father.graphic,"tile-64-160", 128, 192,1000000);
			addTile(father.graphic,"tile-32-960", 128, 224,1000000);
			addTile(father.graphic,"tile-32-992", 128, 256,1000000);
			addTile(father.graphic,"tile-32-1024", 128, 288,1000000);
			addTile(father.graphic,"tile-0-960", 0, 288,1000000);
			addTile(father.graphic,"tile-0-32", 0, 256,1000000);
			addTile(father.graphic,"tile-0-32", 64, 192,1000000);
			addTile(father.graphic,"tile-64-32", 448, 192,1000000);
			addTile(father.graphic,"tile-64-32", 480, 256,1000000);
			addTile(father.graphic,"tile-0-0", 0, 224,1000000);
			addTile(father.graphic,"tile-0-0", 64, 160,1000000);
			addTile(father.graphic,"tile-32-0", 32, 224,1000000);
			addTile(father.graphic,"tile-32-0", 96, 160,1000000);
			addTile(father.graphic,"tile-32-0", 416, 160,1000000);
			addTile(father.graphic,"tile-64-0", 448, 160,1000000);
			addTile(father.graphic,"tile-64-0", 480, 224,1000000);
			addTile(father.graphic,"tile-64-0", 800, 256,1000000);
			addTile(father.graphic,"tile-32-0", 768, 256,1000000);
			addTile(father.graphic,"tile-32-0", 736, 256,1000000);
			addTile(father.graphic,"tile-0-0", 704, 256,1000000);
			addTile(father.graphic,"tile-128-1120", 64, 288,1000000);
			addTile(father.graphic,"tile-128-1120", 96, 256,1000000);
			addTile(father.graphic,"tile-160-1152", 64, 256,1000000);
			addTile(father.graphic,"tile-160-1152", 96, 288,1000000);
			addTile(father.graphic,"tile-160-1088", 96, 224,1000000);
			addTile(father.graphic,"tile-160-1120", 32, 288,1000000);
			addTile(father.graphic,"tile-160-1120", 416, 256,1000000);
			addTile(father.graphic,"tile-160-1120", 448, 288,1000000);
			addTile(father.graphic,"tile-160-1152", 416, 224,1000000);
			addTile(father.graphic,"tile-160-1152", 448, 256,1000000);
			addTile(father.graphic,"tile-160-1088", 416, 288,1000000);
			addTile(father.graphic,"tile-128-1472", 160, 288,1000000);
			addTile(father.graphic,"tile-128-1472", 192, 288,1000000);
			addTile(father.graphic,"tile-128-1472", 224, 288,1000000);
			addTile(father.graphic,"tile-128-1472", 256, 288,1000000);
			addTile(father.graphic,"tile-128-1472", 288, 288,1000000);
			addTile(father.graphic,"tile-128-1472", 320, 288,1000000);
			addTile(father.graphic,"tile-128-1472", 352, 288,1000000);
			addTile(father.graphic,"tile-0-1472", 160, 256,1000000);
			addTile(father.graphic,"tile-0-1472", 224, 256,1000000);
			addTile(father.graphic,"tile-0-1472", 288, 256,1000000);
			addTile(father.graphic,"tile-0-1472", 320, 256,1000000);
			addTile(father.graphic,"tile-0-1472", 352, 256,1000000);
			addTile(father.graphic,"tile-32-1472", 256, 256,1000000);
			addTile(father.graphic,"tile-64-1472", 192, 256,1000000);


		};
		mountMap[7] = function mountMap8(father)
		{
			addScenarioObject(new chao(), father, 0, 288);
			addScenarioObject(new chao(), father, 32, 288);
			addScenarioObject(new chao(), father, 64, 288);
			addScenarioObject(new chao(), father, 96, 288);
			addScenarioObject(new chao(), father, 352, 160);
			addScenarioObject(new chao(), father, 544, 224);
			addScenarioObject(new chao(), father, 576, 224);
			addScenarioObject(new chao(), father, 608, 224);
			addScenarioObject(new chao(), father, 640, 224);
			addScenarioObject(new chao(), father, 672, 224);
			addScenarioObject(new chao(), father, 704, 224);
			addScenarioObject(new chao(), father, 736, 224);
			addScenarioObject(new chao(), father, 768, 224);
			addScenarioObject(new chao(), father, 800, 224);
			addScenarioObject(new chao(), father, 832, 224);
			addScenarioObject(new chao(), father, 896, 288);
			addScenarioObject(new chao(), father, 192, 224);
			addScenarioObject(new chao(), father, 192, 256);
			addScenarioObject(new chao(), father, 192, 288);
			addScenarioObject(new chao(), father, 224, 224);
			addScenarioObject(new chao(), father, 224, 256);
			addScenarioObject(new chao(), father, 224, 288);
			addScenarioObject(new chao(), father, 320, 160);
			addScenarioObject(new chao(), father, 320, 192);
			addScenarioObject(new chao(), father, 320, 224);
			addScenarioObject(new chao(), father, 320, 256);
			addScenarioObject(new chao(), father, 320, 288);
			addScenarioObject(new chao(), father, 352, 192);
			addScenarioObject(new chao(), father, 352, 224);
			addScenarioObject(new chao(), father, 352, 256);
			addScenarioObject(new chao(), father, 352, 288);
			addScenarioObject(new chao(), father, 512, 224);
			addScenarioObject(new chao(), father, 864, 288);
			addScenarioObject(new espinho(), father, 96, 256);
			addScenarioObject(new espinho(), father, 608, 192);
			addScenarioObject(new espinho(), father, 736, 192);
			addScenarioObject(new espinho(), father, 672, 64);
			addScenarioObject(new espinho(), father, 512, 64);
			addScenarioObject(new espinho(), father, 640, 192);
			addScenarioObject(new espinho(), father, 832, 96);
			addScenarioObject(new espinho(), father, 896, 256);
			addScenarioObject(new bonus(), father, 226, 113);
			addScenarioObject(new bonus(), father, 672, 96);
			addScenarioObject(new bonus(), father, 800, 96);

			addTile(father.graphic,"tile-128-0", 608, 192,1000001);
			addTile(father.graphic,"tile-0-256", 512, 192,1000001);
			addTile(father.graphic,"tile-32-256", 544, 192,1000001);
			addTile(father.graphic,"tile-64-256", 576, 192,1000001);
			addTile(father.graphic,"tile-0-32", 0, 288,1000001);
			addTile(father.graphic,"tile-64-288", 352, 160,1000001);
			addTile(father.graphic,"tile-32-32", 32, 288,1000000);
			addTile(father.graphic,"tile-32-32", 64, 288,1000000);
			addTile(father.graphic,"tile-64-32", 96, 288,1000000);
			addTile(father.graphic,"tile-32-0", 32, 256,1000000);
			addTile(father.graphic,"tile-32-0", 64, 256,1000000);
			addTile(father.graphic,"tile-64-0", 96, 256,1000000);
			addTile(father.graphic,"tile-0-0", 0, 256,1000000);
			addTile(father.graphic,"tile-96-288", 512, 224,1000000);
			addTile(father.graphic,"tile-128-288", 544, 224,1000000);
			addTile(father.graphic,"tile-160-288", 576, 224,1000000);
			addTile(father.graphic,"tile-0-768", 608, 224,1000000);
			addTile(father.graphic,"tile-32-768", 736, 224,1000000);
			addTile(father.graphic,"tile-64-768", 768, 224,1000000);
			addTile(father.graphic,"tile-96-768", 800, 224,1000000);
			addTile(father.graphic,"tile-128-768", 832, 224,1000000);
			addTile(father.graphic,"tile-64-448", 672, 224,1000000);
			addTile(father.graphic,"tile-64-448", 704, 224,1000000);
			addTile(father.graphic,"tile-64-448", 640, 224,1000000);
			addTile(father.graphic,"tile-0-352", 864, 288,1000000);
			addTile(father.graphic,"tile-64-352", 896, 288,1000000);
			addTile(father.graphic,"tile-0-320", 864, 256,1000000);
			addTile(father.graphic,"tile-64-320", 896, 256,1000000);
			addTile(father.graphic,"tile-64-320", 832, 192,1000000);
			addTile(father.graphic,"tile-64-320", 800, 192,1000000);
			addTile(father.graphic,"tile-64-320", 768, 192,1000000);
			addTile(father.graphic,"tile-64-320", 736, 192,1000000);
			addTile(father.graphic,"tile-0-288", 192, 224,1000000);
			addTile(father.graphic,"tile-0-960", 192, 256,1000000);
			addTile(father.graphic,"tile-0-960", 192, 288,1000000);
			addTile(father.graphic,"tile-32-960", 224, 256,1000000);
			addTile(father.graphic,"tile-32-960", 224, 288,1000000);
			addTile(father.graphic,"tile-64-288", 224, 224,1000000);
			addTile(father.graphic,"tile-32-256", 192, 192,1000000);
			addTile(father.graphic,"tile-32-256", 224, 192,1000000);
			addTile(father.graphic,"tile-32-256", 320, 128,1000000);
			addTile(father.graphic,"tile-32-256", 352, 128,1000000);
			addTile(father.graphic,"tile-32-992", 352, 224,1000000);
			addTile(father.graphic,"tile-32-992", 352, 192,1000000);
			addTile(father.graphic,"tile-32-992", 352, 256,1000000);
			addTile(father.graphic,"tile-32-992", 352, 288,1000000);
			addTile(father.graphic,"tile-0-992", 320, 192,1000000);
			addTile(father.graphic,"tile-0-992", 320, 224,1000000);
			addTile(father.graphic,"tile-0-992", 320, 288,1000000);
			addTile(father.graphic,"tile-0-992", 320, 256,1000000);
			addTile(father.graphic,"tile-0-288", 320, 160,1000000);
			addTile(father.graphic,"tile-128-384", 704, 160,1000000);
			addTile(father.graphic,"tile-128-416", 704, 192,1000000);
			addTile(father.graphic,"tile-160-384", 736, 160,1000000);
			addTile(father.graphic,"tile-160-416", 736, 192,1000000);
			addTile(father.graphic,"tile-96-416", 672, 192,1000000);
			addTile(father.graphic,"tile-0-384", 608, 160,1000000);
			addTile(father.graphic,"tile-0-416", 608, 192,1000000);
			addTile(father.graphic,"tile-32-416", 640, 192,1000000);


		};
		mountMap[8] = function mountMap9(father)
		{
			addScenarioObject(new chao(), father, 0, 288);
			addScenarioObject(new chao(), father, 32, 288);
			addScenarioObject(new chao(), father, 64, 288);
			addScenarioObject(new chao(), father, 96, 288);
			addScenarioObject(new chao(), father, 352, 160);
			addScenarioObject(new chao(), father, 544, 224);
			addScenarioObject(new chao(), father, 576, 224);
			addScenarioObject(new chao(), father, 608, 224);
			addScenarioObject(new chao(), father, 640, 224);
			addScenarioObject(new chao(), father, 672, 224);
			addScenarioObject(new chao(), father, 704, 224);
			addScenarioObject(new chao(), father, 736, 224);
			addScenarioObject(new chao(), father, 768, 224);
			addScenarioObject(new chao(), father, 800, 224);
			addScenarioObject(new chao(), father, 832, 224);
			addScenarioObject(new chao(), father, 896, 288);
			addScenarioObject(new chao(), father, 192, 224);
			addScenarioObject(new chao(), father, 192, 256);
			addScenarioObject(new chao(), father, 192, 288);
			addScenarioObject(new chao(), father, 224, 224);
			addScenarioObject(new chao(), father, 224, 256);
			addScenarioObject(new chao(), father, 224, 288);
			addScenarioObject(new chao(), father, 320, 160);
			addScenarioObject(new chao(), father, 320, 192);
			addScenarioObject(new chao(), father, 320, 224);
			addScenarioObject(new chao(), father, 320, 256);
			addScenarioObject(new chao(), father, 320, 288);
			addScenarioObject(new chao(), father, 352, 192);
			addScenarioObject(new chao(), father, 352, 224);
			addScenarioObject(new chao(), father, 352, 256);
			addScenarioObject(new chao(), father, 352, 288);
			addScenarioObject(new chao(), father, 512, 224);
			addScenarioObject(new chao(), father, 864, 288);
			addScenarioObject(new espinho(), father, 96, 256);
			addScenarioObject(new espinho(), father, 608, 192);
			addScenarioObject(new espinho(), father, 736, 192);
			addScenarioObject(new espinho(), father, 672, 64);
			addScenarioObject(new espinho(), father, 512, 64);
			addScenarioObject(new espinho(), father, 640, 192);
			addScenarioObject(new espinho(), father, 832, 96);
			addScenarioObject(new espinho(), father, 896, 256);
			addScenarioObject(new bonus(), father, 226, 113);
			addScenarioObject(new bonus(), father, 672, 96);
			addScenarioObject(new bonus(), father, 800, 96);

			addTile(father.graphic,"tile-128-0", 608, 192,1000001);
			addTile(father.graphic,"tile-0-256", 512, 192,1000001);
			addTile(father.graphic,"tile-32-256", 544, 192,1000001);
			addTile(father.graphic,"tile-64-256", 576, 192,1000001);
			addTile(father.graphic,"tile-0-32", 0, 288,1000001);
			addTile(father.graphic,"tile-64-288", 352, 160,1000001);
			addTile(father.graphic,"tile-32-32", 32, 288,1000000);
			addTile(father.graphic,"tile-32-32", 64, 288,1000000);
			addTile(father.graphic,"tile-64-32", 96, 288,1000000);
			addTile(father.graphic,"tile-32-0", 32, 256,1000000);
			addTile(father.graphic,"tile-32-0", 64, 256,1000000);
			addTile(father.graphic,"tile-64-0", 96, 256,1000000);
			addTile(father.graphic,"tile-0-0", 0, 256,1000000);
			addTile(father.graphic,"tile-96-288", 512, 224,1000000);
			addTile(father.graphic,"tile-128-288", 544, 224,1000000);
			addTile(father.graphic,"tile-160-288", 576, 224,1000000);
			addTile(father.graphic,"tile-0-768", 608, 224,1000000);
			addTile(father.graphic,"tile-32-768", 736, 224,1000000);
			addTile(father.graphic,"tile-64-768", 768, 224,1000000);
			addTile(father.graphic,"tile-96-768", 800, 224,1000000);
			addTile(father.graphic,"tile-128-768", 832, 224,1000000);
			addTile(father.graphic,"tile-64-448", 672, 224,1000000);
			addTile(father.graphic,"tile-64-448", 704, 224,1000000);
			addTile(father.graphic,"tile-64-448", 640, 224,1000000);
			addTile(father.graphic,"tile-0-352", 864, 288,1000000);
			addTile(father.graphic,"tile-64-352", 896, 288,1000000);
			addTile(father.graphic,"tile-0-320", 864, 256,1000000);
			addTile(father.graphic,"tile-64-320", 896, 256,1000000);
			addTile(father.graphic,"tile-64-320", 832, 192,1000000);
			addTile(father.graphic,"tile-64-320", 800, 192,1000000);
			addTile(father.graphic,"tile-64-320", 768, 192,1000000);
			addTile(father.graphic,"tile-64-320", 736, 192,1000000);
			addTile(father.graphic,"tile-0-288", 192, 224,1000000);
			addTile(father.graphic,"tile-0-960", 192, 256,1000000);
			addTile(father.graphic,"tile-0-960", 192, 288,1000000);
			addTile(father.graphic,"tile-32-960", 224, 256,1000000);
			addTile(father.graphic,"tile-32-960", 224, 288,1000000);
			addTile(father.graphic,"tile-64-288", 224, 224,1000000);
			addTile(father.graphic,"tile-32-256", 192, 192,1000000);
			addTile(father.graphic,"tile-32-256", 224, 192,1000000);
			addTile(father.graphic,"tile-32-256", 320, 128,1000000);
			addTile(father.graphic,"tile-32-256", 352, 128,1000000);
			addTile(father.graphic,"tile-32-992", 352, 224,1000000);
			addTile(father.graphic,"tile-32-992", 352, 192,1000000);
			addTile(father.graphic,"tile-32-992", 352, 256,1000000);
			addTile(father.graphic,"tile-32-992", 352, 288,1000000);
			addTile(father.graphic,"tile-0-992", 320, 192,1000000);
			addTile(father.graphic,"tile-0-992", 320, 224,1000000);
			addTile(father.graphic,"tile-0-992", 320, 288,1000000);
			addTile(father.graphic,"tile-0-992", 320, 256,1000000);
			addTile(father.graphic,"tile-0-288", 320, 160,1000000);
			addTile(father.graphic,"tile-128-384", 704, 160,1000000);
			addTile(father.graphic,"tile-128-416", 704, 192,1000000);
			addTile(father.graphic,"tile-160-384", 736, 160,1000000);
			addTile(father.graphic,"tile-160-416", 736, 192,1000000);
			addTile(father.graphic,"tile-96-416", 672, 192,1000000);
			addTile(father.graphic,"tile-0-384", 608, 160,1000000);
			addTile(father.graphic,"tile-0-416", 608, 192,1000000);
			addTile(father.graphic,"tile-32-416", 640, 192,1000000);


		};
		
		
		//cria uma fase
		function stage ()
		{
			this.gid = 0;
			this.obtype="c_stage";
			
			this.cdata = [];
			this.x=0;
			this.y=0;
			this.z=0;
			this.graphic = {};
			this.self = this;
			this.active=0;
			this.mid=0;
			this.respawn=0;
			this.create = function ()
			{
				this.graphic = new PIXI.DisplayObjectContainer(); //o grafico da fase eh um container, para adicionar os graficos
				this.graphic.depth = 101;	
				this.graphic.x = 0;
				this.graphic.y = 0;
				
				mountMap[this.mid](this); //monta a fase

				this.graphic.children.sort(function(obj1, obj2) { return  obj2.depth - obj1.depth; }); //ordena a profundidade dos graficos
				
				world2d.addChild( this.graphic ); //adiciona os graficos no jogo
			};
			this.update = function ()
			{
				if (this.respawn==2)
					this.respawn=0;
					
				if (this.respawn==1)
					this.respawn++;
				
				this.graphic.x = this.x;
				this.graphic.y = this.y;
				
				if (this.x<(camera2d.x-960))
				{
					this.active=0;
				}
				
			};
			
			this._update = function()
			{
			}
		
		}
			
		function gameRoom1 ()
		{
			this.gid = 0;
			this.obtype="c_room";
			
			this.cdata = [];
			this.x=0;
			this.y=0;
			this.z=0;
			this.graphic = {};
			this.room_width = 8000;
			this.room_height = 320;
			this.start=0;
			this.restart=0;
			this.maps = [];
			this.position=1;
			this.count = 0;
			this.jogador= {};
			this.texts = [];
			this.c=0;
			this.endmenu=0;
			this.endstart=0;
			this.pontos =0;
			this.startmenu=0;
			this.create = function ()
			{
				//cria os pontos de load
				this.texts['loading'] = new PIXI.Text(".", {font:"16px Arial", fill:"blue"});
				this.texts['loading'].x = 0;
				this.texts['loading'].y = 280;
				this.texts['loading'].depth = 10001;
				scene_UI.addChild(this.texts['loading']);
				
				//cria a distancia na tela
				this.texts['pontos'] = new PIXI.Text("", {font:"16px Arial", fill:"yellow"});
				this.texts['pontos'].x = 310;
				this.texts['pontos'].y = 15;
				this.texts['pontos'].depth = 100;
				scene_UI.addChild(this.texts['pontos']);
				
				//cria pontos quando morrer
				this.texts['pontosfim'] = new PIXI.Text("", {font:"32px Arial", fill:"white"});
				this.texts['pontosfim'].x = 170;
				this.texts['pontosfim'].y = 198;
				this.texts['pontosfim'].depth = 100;
				this.texts['pontosfim'].visible=0;
				scene_UI.addChild(this.texts['pontosfim']);
				
				//imagem bg
				this.graphic = new PIXI.Sprite(textures["background"]); // makeVerticalGradientBar([188,86,18],[99,21,21],width,height);
				this.graphic2 = new PIXI.Sprite(textures["background"]);
				//imagem titulo
				this.graphic3 = new PIXI.Sprite(textures["title"]);
				this.graphic4 = new PIXI.Sprite(textures["title2"]);
				//imagem perda
				this.graphic5 = new PIXI.Sprite(textures["lostpage"]);
				this.graphic5.depth = 150;
				this.graphic5.visible=0;
				
				//imagem instrucoes
				this.graphic6 = new PIXI.Sprite(textures["intrucoes.png"]);
				this.graphic6.x = 40;
				this.graphic6.y = 15;
				this.graphic6.depth = 1;
				this.graphic6.visible=0;
				
				//imagem de help
				this.graphic7 = new PIXI.Sprite(textures["help.png"]);
				this.graphic7.x =400;
				this.graphic7.y = 100;
				this.graphic7.depth = 100;
				this.graphic7.visible=0;
				
				this.graphic2.x=480;
				this.graphic.depth = 1000;
				this.graphic2.depth = 1000;
				
				this.graphic3.x=142;
				this.graphic3.y=26;
				this.graphic3.depth = 100;
				
				this.graphic4.x=111;
				this.graphic4.y=222;
				this.graphic4.depth = 100;
				
				//adiciona nos graficos
				scene_UI.addChild(this.graphic);
				scene_UI.addChild(this.graphic2);
				scene_UI.addChild(this.graphic3);
				scene_UI.addChild(this.graphic4);
				scene_UI.addChild(this.graphic5);
				scene_UI.addChild(this.graphic6);

				world2d.addChild(this.graphic7);
			};
			
			this.update = function ()
			{
			this.c++
			if (this.c>4)
			{
				this.texts['loading'].text= this.texts['loading'].text+'.';
				this.c=0;
			}
			if (key.pressed(13) && this.start==0)
				{
					if (this.startmenu==0)
					{
						this.graphic6.visible=1;
						this.startmenu++;
					}else
					{
						this.graphic6.visible=0;
						this.texts['loading'].visible = 0;
						this.graphic3.visible=0;
						this.graphic4.visible=0;
						
						this.jogador = gameSystem.instanceCreate(new player(),20,0,DZ);
						var a,b=960;
						
						for (var i=0;i<9;i++)
						{
							a = new stage();
							a.mid = i;
							this.maps[i] = gameSystem.instanceCreate(a,-1000,0,DZ);
							this.maps[i].active=0;
						}
						this.maps[0].active=1;
						this.maps[0].x=0;
						
						this.start=1;
						
						this.graphic7.visible=1;
						sounds ['bgm'].volume(0);
						sounds ['bgm'].play();
						sounds ['bgm'].fade(0,0.8,80000);
					}
				}
				
				if (this.start==1)
				{
					var rand;
					this.count=0;
					for(var i = 0; i<9;i++)
					{
						if (this.maps[i].active==1)
						{
							this.count++;
						}
					}
					if (this.count<4) // so coloca um mapa se nao tiver mais de 3 na tela
					{
						rand = Math.random()*10;
						rand = rand%9;
						rand = Math.floor(rand);
						if (this.maps[rand].active==0)
						{
							this.maps[rand].active=1;
							this.maps[rand].respawn=1;
							this.maps[rand].x = this.position*960;
							this.position++;
						}
					}
					
					//verifica se o jogador morreu
					if (this.jogador.vidas<0)
					{
						this.jogador.stop=1;
						this.jogador.graphic.visible=0;
						this.endmenu=1;
						this.endstart=0;
					}
						
				
				}
				
				if (this.endmenu==1)
				{
					if (this.endstart==0)
					{
						this.graphic5.visible=1;
						this.texts['pontosfim'].text = this.pontos+" pontos";
						this.texts['pontosfim'].visible=1;
						sounds ['bgm'].stop();
						this.endstart=1;
					}
					
					if (key.pressed(13))
					{
						this.endmenu=0;
						this.endstart=0;
						this.texts['pontosfim'].visible=0;
						this.graphic5.visible=0;
						
						for (var i=0;i<9;i++)
						{
							this.maps[i].active=0;
							this.maps[i].x = -1000;
						}
						
						this.maps[0].active=1;
						this.maps[0].x=0;
						
						camera2d.x=0;
						camera2d.y=0;
						this.jogador.x = -400;
						this.jogador.y = 0;
						this.jogador.hspeed=1;
						this.jogador.stop=0;
						this.position=1;
						this.jogador.vidas=5;
						this.jogador.graphic.visible=1;
						
						sounds ['bgm'].volume(0.8);
						sounds ['bgm'].play();
					}
					
				}
			
			};
			
			this._update = function()
			{
				
			}
		}


			gameSystem.start();
			gameSystem.instanceCreate(new gameRoom1(),0,0,0);
			var render = function () 
			{
				requestAnimationFrame( render );

				
				gameSystem.update();
				
				
				key.cleanSystem();
			};

			render();