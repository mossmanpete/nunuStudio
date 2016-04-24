function Interface(){}

Interface.initialize = function()
{	
	//File directory
	Interface.file_dir = "editor/files/";

	//Style
	Interface.theme = new Style();
	Interface.theme.setStyleSheet(Interface.file_dir + "css/dark.css");

	//------------------------------------Tab Container-------------------------------
	Interface.tab = new TabGroup();
	
	//Scene Canvas
	var scene = Interface.tab.addOption("scene", Interface.file_dir + "icons/tab/scene.png", true);
	var canvas = new SceneEditor();
	canvas.setScene(Editor.program.scene);
	scene.attachComponent(canvas);

	//Set render canvas
	Editor.setRenderCanvas(canvas.element);

	//---------------------------------Asset Manager----------------------------------
	Interface.asset_explorer = new DivisionResizable();
	Interface.asset_explorer.resizable_side = DivisionResizable.TOP;
	Interface.asset_explorer.size.y = 150;
	Interface.asset_explorer.updateInterface();

	Interface.asset_explorer_bar = new Division(Interface.asset_explorer.element);
	Interface.asset_explorer_bar.position.set(0, 0);
	Interface.asset_explorer_bar.size.y = 25;
	Interface.asset_explorer_bar.element.className = "bar";
	Interface.asset_explorer_bar.updateInterface();

	//File
	Interface.asset_file = new DropdownMenu(Interface.asset_explorer_bar.element);
	Interface.asset_file.setText("Models");
	Interface.asset_file.size.set(120, Interface.asset_explorer_bar.size.y);
	Interface.asset_file.position.set(0,0);
	
	Interface.asset_file.addOption("Import obj", function()
	{
		App.chooseFile(function(event)
		{
			var file = event.srcElement.value;
			try
			{
				var loader = new THREE.OBJLoader();
				var obj = loader.parse(App.readFile(file));

				ObjectUtils.setShadowCasting(obj, true);
				ObjectUtils.setShadowReceiving(obj, true);
				Editor.addToActualScene(ObjectUtils.convertFromThreeType(obj));
			}
			catch(e)
			{
				alert("Error loading file\n("+e+")");
			}
		}, ".obj");
	});

	Interface.asset_file.addOption("Import Collada", function()
	{
		App.chooseFile(function(event)
		{
			var file = event.srcElement.value;
			try
			{
				var loader = new THREE.ColladaLoader();
				var obj = loader.parse(App.readFile(file));

				ObjectUtils.setShadowCasting(obj.scene, true);
				ObjectUtils.setShadowReceiving(obj.scene, true);
				Editor.addToActualScene(ObjectUtils.convertFromThreeType(obj.scene));
			}
			catch(e)
			{
				alert("Error loading file\n("+e+")");
			}
		}, ".dae");
	});

	Interface.asset_file.addOption("Import json", function()
	{
		App.chooseFile(function(event)
		{
			var file = event.srcElement.value;
			try
			{
				var loader = new THREE.JSONLoader();
				loader.load(file, function(geometry, materials)
				{
					for(var i = 0; i < materials.length; i ++)
					{
						var m = materials[i];
						m.skinning = true;
						m.morphTargets = true;
					}

					var obj = new AnimatedModel(geometry, new THREE.MultiMaterial(materials));
					Editor.addToActualScene(obj);
				});
			}
			catch(e)
			{
				alert("Error loading file\n("+e+")");
			}
		}, ".json, .js");
	});

	Interface.asset_file.addOption("Import VRML", function()
	{
		App.chooseFile(function(event)
		{
			var file = event.srcElement.value;
			try
			{
				var loader = new THREE.VRMLLoader();
				var obj = loader.parse(App.readFile(file));

				ObjectUtils.setShadowCasting(obj, true);
				ObjectUtils.setShadowReceiving(obj, true);
				Editor.addToActualScene(ObjectUtils.convertFromThreeType(obj));
			}
			catch(e)
			{
				alert("Error loading file\n("+e+")");
			}
		}, ".wrl, .vrml");
	});

	/*Interface.asset_file.addOption("Import FBX", function()
	{
		App.chooseFile(function(event)
		{
			var file = event.srcElement.value;
			try
			{
				var loader = new THREE.FBXLoader();
				var obj = loader.parse(App.readFile(file));

				ObjectUtils.setShadowCasting(obj, true);
				ObjectUtils.setShadowReceiving(obj, true);

				Editor.addToActualScene(ObjectUtils.convertFromThreeType(obj));
			}
			catch(e)
			{
				alert("Error loading file\n("+e+")");
			}
		}, ".fbx");
	});*/

	//Add assets
	Interface.asset_add = new DropdownMenu(Interface.asset_explorer_bar.element);
	Interface.asset_add.setText("Texture");
	Interface.asset_add.size.set(100, Interface.asset_explorer_bar.size.y);
	Interface.asset_add.position.set(120,0);
	Interface.asset_add.addOption("Import Texture", function()
	{
		App.chooseFile(function(event)
		{
			var file = event.srcElement.value;
			try
			{
				var map = new THREE.TextureLoader().load(file);
				var material = new THREE.SpriteMaterial({map: map, color: 0xffffff});
				var sprite = new Sprite(material);
				Editor.addToActualScene(sprite);
			}
			catch(e)
			{
				alert("Error loading file");
			}
		}, "image/*");
	});

	//------------------------------------Explorer------------------------------------
	Interface.explorer = new DivisionResizable();
	Interface.explorer.size.x = 300;
	Interface.explorer.resize_size_min = 100;

	Interface.explorer_resizable = new DualDivisionResizable(Interface.explorer.element);
	Interface.explorer_resizable.orientation = DualDivisionResizable.VERTICAL;
	Interface.explorer_resizable.tab_position = 450;

	//Project explorer
	Interface.tree_view = new TreeView(Interface.explorer_resizable.div_a, Interface.explorer_resizable);
	Interface.tree_view.updateInterface();

	//Object panel variables
	Interface.panel = new Form(Interface.explorer_resizable.div_b);

	//------------------------------------Tool Bar------------------------------------
	Interface.tool_bar = new Division();
	Interface.tool_bar.size.x = 40;
	Interface.tool_bar.element.className = "bar";

	//Tools text
	Interface.tool_text = new Text(Interface.tool_bar.element);
	Interface.tool_text.setText("Tools");
	Interface.tool_text.position.set(Interface.tool_bar.size.x/2, 40);
	Interface.tool_text.updateInterface();

	//Select
	Interface.tool_select = new ButtonImageToggle();
	Interface.tool_select.selected = true;
	Interface.tool_select.setImage(Interface.file_dir + "icons/tools/select.png");
	Interface.tool_select.image_scale.set(0.7, 0.7);
	Interface.tool_select.size.set(Interface.tool_bar.size.x, Interface.tool_bar.size.x);
	Interface.tool_select.position.set(0, 80);
	Interface.tool_select.updateInterface();
	Interface.tool_select.setCallback(function()
	{
		Editor.tool_mode = Editor.MODE_SELECT;
		Interface.tool_select.selected = true;
		Interface.tool_move.selected = false;
		Interface.tool_resize.selected = false;
		Interface.tool_rotate.selected = false;
		Interface.tool_rotate.updateInterface();
		Interface.tool_move.updateInterface();
		Interface.tool_resize.updateInterface();
		Interface.tool_select.updateInterface();
	});

	//Move
	Interface.tool_move = new ButtonImageToggle();
	Interface.tool_move.setImage(Interface.file_dir + "icons/tools/move.png");
	Interface.tool_move.image_scale.set(0.7, 0.7);
	Interface.tool_move.size.set(Interface.tool_bar.size.x, Interface.tool_bar.size.x);
	Interface.tool_move.position.set(0, 120);
	Interface.tool_move.updateInterface();
	Interface.tool_move.setCallback(function()
	{
		Editor.tool_mode = Editor.MODE_MOVE;
		Interface.tool_move.selected = true;
		Interface.tool_select.selected = false;
		Interface.tool_resize.selected = false;
		Interface.tool_rotate.selected = false;
		Interface.tool_rotate.updateInterface();
		Interface.tool_move.updateInterface();
		Interface.tool_resize.updateInterface();
		Interface.tool_select.updateInterface();
	});

	//Resize
	Interface.tool_resize = new ButtonImageToggle();
	Interface.tool_resize.setImage(Interface.file_dir + "icons/tools/resize.png");
	Interface.tool_resize.image_scale.set(0.7, 0.7);
	Interface.tool_resize.size.set(Interface.tool_bar.size.x, Interface.tool_bar.size.x);
	Interface.tool_resize.position.set(0, 160);
	Interface.tool_resize.updateInterface();
	Interface.tool_resize.setCallback(function()
	{
		Editor.tool_mode = Editor.MODE_RESIZE;
		Interface.tool_resize.selected = true;
		Interface.tool_move.selected = false;
		Interface.tool_select.selected = false;
		Interface.tool_rotate.selected = false;
		Interface.tool_rotate.updateInterface();
		Interface.tool_move.updateInterface();
		Interface.tool_resize.updateInterface();
		Interface.tool_select.updateInterface();
	});

	//Rotate
	Interface.tool_rotate = new ButtonImageToggle();
	Interface.tool_rotate.setImage(Interface.file_dir + "icons/tools/rotate.png");
	Interface.tool_rotate.image_scale.set(0.7, 0.7);
	Interface.tool_rotate.size.set(Interface.tool_bar.size.x, Interface.tool_bar.size.x);
	Interface.tool_rotate.position.set(0, 200);
	Interface.tool_rotate.updateInterface();
	Interface.tool_rotate.setCallback(function()
	{
		Editor.tool_mode = Editor.MODE_ROTATE;
		Interface.tool_rotate.selected = true;
		Interface.tool_move.selected = false;
		Interface.tool_resize.selected = false;
		Interface.tool_select.selected = false;
		Interface.tool_rotate.updateInterface();
		Interface.tool_move.updateInterface();
		Interface.tool_resize.updateInterface();
		Interface.tool_select.updateInterface();
	});
 
	//Add Text
	Interface.add_text = new Text(Interface.tool_bar.element);
	Interface.add_text.setText("Add");
	Interface.add_text.position.set(Interface.tool_bar.size.x/2, 240);
	Interface.add_text.updateInterface();

	//Add Models
	Interface.add_model = new ButtonDrawer();
	Interface.add_model.setImage(Interface.file_dir + "icons/models/models.png");
	Interface.add_model.image_scale.set(0.7, 0.7);
	Interface.add_model.options_scale.set(0.7, 0.7);
	Interface.add_model.size.set(Interface.tool_bar.size.x, Interface.tool_bar.size.x);
	Interface.add_model.position.set(0, 280);
	Interface.add_model.options_size.set(40, 40);
	Interface.add_model.updateInterface();

	//Cube
	Interface.add_model.addOption(Interface.file_dir + "icons/models/cube.png", function()
	{
		var geometry = new THREE.BoxGeometry(1, 1, 1);
		var material = new THREE.MeshPhongMaterial();
		var model = new Model3D(geometry, material);
		model.receiveShadow = true;
		model.castShadow = true;
		model.name = "cube";
		Editor.addToActualScene(model);
	});

	//Cylinder
	Interface.add_model.addOption(Interface.file_dir + "icons/models/cylinder.png", function()
	{
		var geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
		var material = new THREE.MeshPhongMaterial();
		var model = new Model3D(geometry, material);
		model.receiveShadow = true;
		model.castShadow = true;
		model.name = "cylinder";
		Editor.addToActualScene(model);
	});

	//Sphere
	Interface.add_model.addOption(Interface.file_dir + "icons/models/sphere.png", function()
	{
		var geometry = new THREE.SphereGeometry(0.6, 16, 16);
		var material = new THREE.MeshPhongMaterial();
		var model = new Model3D(geometry, material);
		model.receiveShadow = true;
		model.castShadow = true;
		model.name = "sphere";
		Editor.addToActualScene(model);
	});

	//Torus
	Interface.add_model.addOption(Interface.file_dir + "icons/models/torus.png", function()
	{
		var geometry = new THREE.TorusGeometry(1, 0.5, 16, 100);
		var material = new THREE.MeshPhongMaterial();
		var model = new Model3D(geometry, material);
		model.receiveShadow = true;
		model.castShadow = true;
		model.name = "torus";
		Editor.addToActualScene(model);
	});

	//Pyramid
	Interface.add_model.addOption(Interface.file_dir + "icons/models/cone.png", function()
	{
		var geometry = new THREE.CylinderGeometry(0, 1, 2, 32);
		var material = new THREE.MeshPhongMaterial();
		var model = new Model3D(geometry, material);
		model.receiveShadow = true;
		model.castShadow = true;
		model.name = "cone";
		Editor.addToActualScene(model);
	});

	//Text
	Interface.add_model.addOption(Interface.file_dir + "icons/models/text.png", function()
	{
		var loader = new THREE.FontLoader().load("data/fonts/helvetiker_bold.typeface.js", function(font)
		{
			var material = new THREE.MeshPhongMaterial();
			var model = new Text3D("text", font, material);
			model.receiveShadow = true;
			model.castShadow = true;
			Editor.addToActualScene(model);
		});
	});

	//Add lights
	Interface.add_light = new ButtonDrawer();
	Interface.add_light.setImage(Interface.file_dir + "icons/lights/point.png");
	Interface.add_light.image_scale.set(0.7, 0.7);
	Interface.add_light.options_scale.set(0.7, 0.7);
	Interface.add_light.size.set(Interface.tool_bar.size.x, Interface.tool_bar.size.x);
	Interface.add_light.position.set(0, 320);
	Interface.add_light.options_size.set(40, 40);
	Interface.add_light.updateInterface();

	//Point Light
	Interface.add_light.addOption(Interface.file_dir + "icons/lights/point.png", function()
	{
		var light = new PointLight();
		Editor.addToActualScene(light);
	});

	//Ambient Light
	Interface.add_light.addOption(Interface.file_dir + "icons/lights/ambient.png", function()
	{
		Editor.addToActualScene(new AmbientLight());
	});

	//Spot Light
	Interface.add_light.addOption(Interface.file_dir + "icons/lights/spot.png", function()
	{
		Editor.addToActualScene(new SpotLight());
	});

	//Directional Light
	Interface.add_light.addOption(Interface.file_dir + "icons/lights/directional.png", function()
	{
		Editor.addToActualScene(new DirectionalLight());
	});

	//Hemisphere Light
	Interface.add_light.addOption(Interface.file_dir + "icons/lights/hemisphere.png", function()
	{
		Editor.addToActualScene(new HemisphereLight());
	});

	//Sky
	Interface.add_light.addOption(Interface.file_dir + "icons/lights/sky.png", function()
	{
		Editor.addToActualScene(new Sky());
	});

	//Add camera
	Interface.add_camera = new ButtonDrawer();
	Interface.add_camera.setImage(Interface.file_dir + "icons/camera/camera.png");
	Interface.add_camera.options_per_line = 2;
	Interface.add_camera.image_scale.set(0.7, 0.7);
	Interface.add_camera.options_scale.set(0.7, 0.7);
	Interface.add_camera.size.set(Interface.tool_bar.size.x, Interface.tool_bar.size.x);
	Interface.add_camera.position.set(0, 360);
	Interface.add_camera.options_size.set(40, 40);
	Interface.add_camera.updateInterface();

	//Prespective camera
	Interface.add_camera.addOption(Interface.file_dir + "icons/camera/prespective.png", function()
	{
		Editor.addToActualScene(new PerspectiveCamera(60, Editor.canvas.width/Editor.canvas.height, 0.1, 1000000));
	});

	//Orthographic camera
	Interface.add_camera.addOption(Interface.file_dir + "icons/camera/orthographic.png", function()
	{
		Editor.addToActualScene(new OrthographicCamera(5, -5, 5, -5, 1, 1000000));
	});

	//Add script
	Interface.add_script = new ButtonDrawer();
	Interface.add_script.setImage(Interface.file_dir + "icons/script/script.png");
	Interface.add_script.options_per_line = 2;
	Interface.add_script.image_scale.set(0.7, 0.7);
	Interface.add_script.options_scale.set(0.7, 0.7);
	Interface.add_script.size.set(Interface.tool_bar.size.x, Interface.tool_bar.size.x);
	Interface.add_script.position.set(0, 400);
	Interface.add_script.options_size.set(40, 40);
	Interface.add_script.updateInterface();

	//Javascript script
	Interface.add_script.addOption(Interface.file_dir + "icons/script/script.png", function()
	{
		Editor.addToActualScene(new Script());
	});

	//Block script
	Interface.add_script.addOption(Interface.file_dir + "icons/script/blocks.png", function()
	{
		//TODO <ADD CODE HERE>
	});

	//Sprites and effects
	Interface.add_effects = new ButtonDrawer();
	Interface.add_effects.setImage(Interface.file_dir + "icons/effects/particles.png");
	Interface.add_effects.options_per_line = 3;
	Interface.add_effects.image_scale.set(0.7, 0.7);
	Interface.add_effects.options_scale.set(0.7, 0.7);
	Interface.add_effects.size.set(Interface.tool_bar.size.x, Interface.tool_bar.size.x);
	Interface.add_effects.position.set(0, 440);
	Interface.add_effects.options_size.set(40, 40);
	Interface.add_effects.updateInterface();

	//Sprite
	Interface.add_effects.addOption(Interface.file_dir + "icons/effects/sprite.png", function()
	{
		var map = new THREE.TextureLoader().load("data/sample.png");
		var material = new THREE.SpriteMaterial({map: map, color: 0xffffff});
		
		var sprite = new Sprite(material);
		Editor.addToActualScene(sprite);
	});

	//Particles
	Interface.add_effects.addOption(Interface.file_dir + "icons/effects/particles.png", function()
	{
		//TODO <ADD CODE HERE>
	});

	//Container
	Interface.add_effects.addOption(Interface.file_dir + "icons/effects/container.png", function()
	{
		Editor.addToActualScene(new Container());
	});

	//Add device
	Interface.add_device = new ButtonDrawer();
	Interface.add_device.setImage(Interface.file_dir + "icons/hw/hw.png");
	Interface.add_device.options_per_line = 2;
	Interface.add_device.image_scale.set(0.7, 0.7);
	Interface.add_device.options_scale.set(0.7, 0.7);
	Interface.add_device.size.set(Interface.tool_bar.size.x, Interface.tool_bar.size.x);
	Interface.add_device.position.set(0, 480);
	Interface.add_device.options_size.set(40, 40);
	Interface.add_device.updateInterface();

	//Leap Hand
	Interface.add_device.addOption(Interface.file_dir + "icons/hw/leap.png", function()
	{
		Editor.addToActualScene(new LeapHand());
	});

	//Kinect Skeleton
	Interface.add_device.addOption(Interface.file_dir + "icons/hw/kinect.png", function()
	{
		Editor.addToActualScene(new KinectDevice());
	});

	//----------------------------------Menu Top Bar----------------------------------
	Interface.top_bar = new Division();
	Interface.top_bar.size.y = 25 ;
	Interface.top_bar.element.className = "bar";

	//Editor Logo
	Interface.image = new Image();
	Interface.image.setImage("data/logo.png");
	Interface.image.size.set(120, 15);
	Interface.image.updateInterface();

	//File
	Interface.file = new DropdownMenu();
	Interface.file.setText("File");
	Interface.file.size.set(120, Interface.top_bar.size.y);
	Interface.file.position.set(0,0);

	Interface.file.addOption("New Project", function()
	{
		if(confirm("All unsaved changes to the project will be lost! Create new File?"))
		{
			Editor.createNewProgram();
			Editor.updateTreeView();
		}
	});

	Interface.file.addOption("Save Project", function()
	{
		App.chooseFile(function(event)
		{
			var file = event.srcElement.value;
			try
			{
				Editor.saveProgram(file);
				alert("File saved");
			}
			catch(e)
			{
				alert("Error saving file");
			}
		}, ".isp", true);
	});

	Interface.file.addOption("Load Project", function()
	{
		if(confirm("All unsaved changes to the project will be lost! Load file?"))
		{
			App.chooseFile(function(event)
			{
				var file = event.srcElement.value;
				try
				{
					Editor.loadProgram(file);
					alert("File loaded");
				}
				catch(e)
				{
					alert("Error loading file\n("+e+")");
				}
			}, ".isp");
		}
	});

	Interface.file.addOption("Settings", function()
	{
		//Check if there is already a settings tab
		var found = false;
		for(var i = 0; i < Interface.tab.options.length; i++)
		{
			if(Interface.tab.options[i].component instanceof SettingsTab)
			{
				found = true;
				Interface.tab.options[i].select();
				break;
			}
		}

		//If not create one
		if(!found)
		{
			var tab = Interface.tab.addOption("Settings", Interface.file_dir + "icons/tab/settings.png", true);
			var settings = new SettingsTab(tab.element);
			tab.attachComponent(settings);
			tab.select();
		}
	});

	Interface.file.addOption("Publish", function()
	{
		//TODO <ADD CODE HERE>
	});

	Interface.file.addOption("Exit", function()
	{
		if(confirm("All unsaved changes to the project will be lost! Do you really wanna exit?"))
		{
			Editor.exit();
		}
	});

	//Editor
	Interface.editor = new DropdownMenu();
	Interface.editor.setText("Edit");
	Interface.editor.size.set(100, Interface.top_bar.size.y);
	Interface.editor.position.set(120,0);

	Interface.editor.addOption("Copy", function()
	{
		Editor.copySelectedObject();
	});
	
	Interface.editor.addOption("Cut", function()
	{
		Editor.cutSelectedObject();
	});

	Interface.editor.addOption("Paste", function()
	{
		Editor.pasteIntoSelectedObject();
	});

	//Project
	Interface.project = new DropdownMenu();
	Interface.project.setText("Project");
	Interface.project.size.set(100, Interface.top_bar.size.y);
	Interface.project.position.set(220,0);

	Interface.project.addOption("Create Scene", function()
	{
		Editor.program.addDefaultScene();
		Editor.updateTreeView();
	});

	Interface.project.addOption("Project Settings", function()
	{
		//TODO <ADD CODE HERE>
	});

	//Run
	Interface.about = new Button();
	Interface.about.setText("About");
	Interface.about.size.set(100, Interface.top_bar.size.y);
	Interface.about.position.set(320, 0);
	Interface.about.updateInterface();
	Interface.about.setCallback(function()
	{
		//TODO <ADD CODE HERE>
	});

	//Run
	Interface.run = new Button();
	Interface.run.setText("Run");
	Interface.run.size.set(100, Interface.top_bar.size.y);
	Interface.run.position.set(420, 0);
	Interface.run.updateInterface();
	Interface.run.setCallback(function()
	{
		if(Editor.state === Editor.STATE_EDITING)
		{
			Interface.run.setText("Stop");
			Editor.setState(Editor.STATE_TESTING);
		}
		else if(Editor.state === Editor.STATE_TESTING)
		{
			Interface.run.setText("Run");
			Editor.setState(Editor.STATE_EDITING);
		}
	});
}

//Loop update elements
Interface.update = function()
{
	Interface.explorer.update();
	Interface.asset_explorer.update();
	Interface.explorer_resizable.update();
}

//Update interface
Interface.updateInterface = function()
{
	//Window size
	var size = new THREE.Vector2(window.innerWidth, window.innerHeight);

	//----------------------------------Menu Top Bar----------------------------------
	Interface.top_bar.size.x = size.x;
	Interface.top_bar.updateInterface();

	//Logo
	Interface.image.position.set(size.x - Interface.image.size.x, 5);
	Interface.image.updateInterface();

	//------------------------------------Tool Bar------------------------------------
	Interface.tool_bar.position.set(0, Interface.top_bar.size.y);
	Interface.tool_bar.size.y = size.y - Interface.top_bar.size.y;
	Interface.tool_bar.updateInterface();

	//------------------------------------Explorer------------------------------------
	Interface.explorer.size.y = (size.y - Interface.top_bar.size.y);
	Interface.explorer.position.set(size.x - Interface.explorer.size.x, Interface.top_bar.size.y);
	Interface.explorer.resize_size_max = size.x/2;
	Interface.explorer.updateInterface();

	Interface.explorer_resizable.size.set(Interface.explorer.size.x - Interface.explorer.resize_tab_size, Interface.explorer.size.y);
	Interface.explorer_resizable.updateInterface();

	Interface.tree_view.updateInterface();
	Interface.panel.updateInterface();

	//---------------------------------Asset Manager----------------------------------
	Interface.asset_explorer.size.x = size.x - Interface.explorer.size.x - Interface.tool_bar.size.x;
	Interface.asset_explorer.position.set(Interface.tool_bar.size.x, size.y - Interface.asset_explorer.size.y);
	Interface.asset_explorer.updateInterface();

	Interface.asset_explorer_bar.size.x = Interface.asset_explorer.size.x;
	Interface.asset_explorer_bar.updateInterface();

	//------------------------------------Tab Container-------------------------------
	Interface.tab.position.set(Interface.tool_bar.size.x, Interface.top_bar.size.y);
	Interface.tab.size.x = (size.x - Interface.tool_bar.size.x - Interface.explorer.size.x);
	Interface.tab.size.y = (size.y - Interface.top_bar.size.y - Interface.asset_explorer.size.y); 
	Interface.tab.updateInterface();

	//Resize editor camera
	Editor.resizeCamera();
}
