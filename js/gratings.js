/* --------------------------------------------------------------

GRATINGS Specific functions for running a grating stimulus demo 
This will allow sinusoids, stripes, disks 

 ----------------------------------------------------------------- */


/* ------------------------------------------------------------------------------

GLOBALS 

--------------------------------------------------------------------------------- */


let FizzyText, gui;
let camera, scene, geometry, material, renderer;
let requestId;
var uniforms, stamp;


/* ------------------------------------------------------------------------------

STARTUP PARAMETERS FOR DAT.GUI CONTROLLER

--------------------------------------------------------------------------------- */

var parameters, last_parameters;

function defaultStimulusParameters () {

	parameters = {  logMAR        : 1.0,
										brightness 		: 1.0,					
										speed 				: 2.5,						
										direction 		: "left", 																				
										stimulus_type : "disks", 


					ratio: { 	"1:2"   : 2.0, 
							 			"1:1.5" : 1.5 },

					bars: { 			frequency 		: 1.0,
												contrast  		: 1.0 }, 
					sinusoids: { 	frequency 		: 1.0,
												contrast  		: 1.0 }, 
					disks: {	ratio    							: "1:2",
										central_intensity  		: 0.75, 
										surround_intensity 		: 0.45,
										background_intensity 	: 0.5,				
										field_spacing 				: 2.0 },
					 sweep: {  enable								: true,
					 					 step_duration				: 0.5,
					 					 step_size						: 0.1,					 					 
					 					 logMAR               : 1.0,		// internal logMAR
					 					 direction						: -1			// internal direction 
					 				 }								 
					};


	last_parameters = JSON.parse(JSON.stringify(parameters));

};

defaultStimulusParameters ();




/* ------------------------------------------------------------------------------

STARTUP PARAMETERS 

--------------------------------------------------------------------------------- */

function destroyMenu () {
	if (gui) {		
		log ('destroyed menu');
	    gui.destroy ();
	   	gui = undefined;
	   }
}
    

function buildMenu (callback) {

  if (gui)	{

  	 log ('build was called. But GUI is not empty.');
     destroyMenu ();
  
  }

  log (`build the menu`);
  gui   = new dat.GUI({ width: 350} );

  gui.add(parameters, 'stimulus_type', 	[ 'sinusoids', 'bars', 'disks' ] ).name('Stimulus').onFinishChange(callback);
  gui.add(parameters, 'logMAR',     	  0.0, 2.0, 0.1).name('logMAR').onFinishChange(callback).listen();
  gui.add(parameters, 'speed', 					0.0, 15.0).name('Speed (deg/s)').onFinishChange(callback);
  gui.add(parameters, 'direction', 			[ 'left', 'right' ]).name('Direction').onFinishChange(callback);
  gui.add(display, 	  'distance', 			[ 50, 70, 100, 150, 300 ] ).name('Distance (cm)').onFinishChange(callback);


	// only allow the sweep option if stimulus if the stimulus is "disks"

	if (parameters.stimulus_type == "disks") {

		  gui.add(parameters.sweep, 'enable').name('Sweep').onFinishChange(callback);
			if (parameters.sweep.enable) {

					let sweep_options = gui.addFolder('Sweep Options');
		  		sweep_options.add(parameters.sweep, 'step_duration', 0.0, 8.0, 0.5).name('Step Duration (s)').onFinishChange(callback);
		  		//sweep_options.add(parameters.sweep, 'step_rate', 0.0, 1.0, 0.01).name('Step Rate (logMAR/s)').onFinishChange(callback);  
		  		sweep_options.open ();
			}

	} 



  // set-up stimulus options 

  var options = gui.addFolder('Specific Stimulus Options');
  setupMenu (options);
  function setupMenu (options) {



  	// particular options for each stimulus 

	  switch (parameters.stimulus_type) {

	  	case "disks":

		  	options.add(parameters.disks, 'ratio',        			[ '1:1.5', '1:2' ]).name('Ratio').onFinishChange(callback);
		  	options.add(parameters.disks, 'central_intensity',    0.0, 1.0, 0.05).name('Central Intensity').onFinishChange(callback);
		  	options.add(parameters.disks, 'surround_intensity',   0.0, 1.0, 0.05).name('Surround Intensity').onFinishChange(callback);
		  	options.add(parameters.disks, 'field_spacing',        0.0, 10.0).name('Spacing (deg)').onFinishChange(callback);

			break;

	  	case "bars":    		// fall-through to sinusoids

	  	case "sinusoids":

 				options.add(parameters.sinusoids, 'contrast',  0.0, 1.0).name('Contrast').onFinishChange(callback);
				options.add(parameters.sinusoids, 'frequency',  0.0, 15).name('Freq.(cpd)').onFinishChange(callback);
		  	break;


		 default:
		 	throw ('error'); 	

	  }
  }
  options.open();


  /* display options */

  //console.log (display);


  let screen_width  = screen.width;
  let screen_height = screen.height;


  var display_options = gui.addFolder('Display Options');
  display_options.add(display.dimension,  			'width', 	51.50).name('Width (cm)').onFinishChange(callback);
  display_options.add(display.dimension,  			'height', 32.50).name('Height (cm)').onFinishChange(callback);
  display_options.add(display.resolution, 			'width', 	screen_width).name('Width (px)').onFinishChange(callback);
  display_options.add(display.resolution, 			'height', screen_height).name('Height (px)').onFinishChange(callback);
  display_options.add(display, 'devicePixelRatio',  1.0, 5.0).name('Device Pixel Ratio').onFinishChange(callback);  
  display_options.open();


}




//----DISK Functions Begin----



async function initializeStimulus () {

	log ("initialize stimulus");

	if (isStimulusActive)
		stopStimulus ();

	experiment = document.getElementById("experiment");

	let shader_frag;
	let v;
	let lambda;

	switch (parameters.stimulus_type) {

		case "disks":

			// initial parameters  

			let k   = parameters.ratio[parameters.disks.ratio];
			let c   = angle2pix(display, logMAR2deg (parameters.logMAR)); 
			let s   = c * k;
			let fsp = angle2pix(display, parameters.disks.field_spacing); 
			v   = -direction * angle2pix(display, parameters.speed);   // px/sec 


			// setup the uniforms 

			uniforms = {
				"CentralRadius": 			{ value: c },
				"PerimeterRadius": 		{ value: s },
				"CentralIntensity": 	{ value: parameters.disks.central_intensity },
				"PerimeterIntensity": { value: parameters.disks.surround_intensity },
				"FieldSpacing": 			{ value: fsp },
				"Brightness": 				{ value: parameters.brightness },	
				"FieldDisplacementX": { value: 0.0 },
				"Velocity": 					{ value: v },									
					"iTime": 						{ value: 0.0 }						
			};


			// shader_frag = getDisksShader ();
			shader_frag = await getShader ('shader/disks_shader.frag');
			
			//console.log ('Shader returned');
			//console.log (shader_frag);

			break;

		case "bars":

			// convert logMAR width to cycles/deg 

			lambda = 2*logMAR2deg(parameters.logMAR); 					// logMAR specification 
			v = -direction * angle2pix(display, parameters.speed);  // deg/sec -> pixels/sec 
			var f = 1/angle2pix(display, lambda);  						 			// cyc/px 

			/* DISKS UNIFORM */
			uniforms = {
				"Contrast": 		{ value: 1.0 }, //parameters.sinusoids.contrast },
				"Frequency": 		{ value: f },
				"Brightness": 	{ value: parameters.brightness },	
				"Velocity": 		{ value: v },					
					"iTime": 			{ value: 0.0 },						
			};


			//shader_frag = getSquareShader ();
			shader_frag = await getShader ('shader/square_shader.frag');
			break;


 	  // setup sinusoidal 

		case "sinusoids":

			lambda 		 = 2*logMAR2deg(parameters.logMAR); 									// logMAR specification 
			v 		   	 = -direction * angle2pix(display, parameters.speed); // deg/sec -> pixels/sec 
			var f      = 1/angle2pix(display, lambda);  					  				// cyc/px 

			/* DISKS UNIFORM */
			uniforms = {
				"Contrast": 		{ value: 1.0 }, //parameters.sinusoids.contrast },
				"Frequency": 		{ value: f },
				"Brightness": 	{ value: parameters.brightness },	
				"Velocity": 		{ value: v },					
					"iTime": 			{ value: 0.0 }						
			};

			//shader_frag = getSinusoidalShader ();
			shader_frag = await getShader ('shader/sinusoidal_shader.frag');
			break; }


	// loading shader 

	//console.log (`Loaded shader for ${parameters.stimulus_type}`);
	//console.log ('Starting THREE.js');
	camera 		= new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );				
	scene 		= new THREE.Scene();
	geometry 	= new THREE.PlaneBufferGeometry( 2, 2 );
	material = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		fragmentShader: shader_frag  
	} );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	//console.log (display);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( display.devicePixelRatio );
	experiment.appendChild( renderer.domElement );
	onWindowResize();
	window.addEventListener( 'resize', onWindowResize, false );

}




//  Animation loop 

var count = 0;
var dt = 0;
var last = (new Date()).getTime();
var direction = 0.0;


function animate() {

	requestId = requestAnimationFrame( animate );
	
	let now = (new Date()).getTime();
	let dt = (now - last)/1000; // seconds 


	// update direction 

	switch (parameters.direction) {
		case "left":
			direction = -1.0;
			break;
		case "right":
			direction = +1.0;
			break;
		default:
			direction = 0.0;
	}


	// perform updating 

	let v;

	switch (parameters.stimulus_type) {

		case "disks" :

			let k   = parameters.ratio[parameters.disks.ratio];
			let c   = angle2pix(display, logMAR2deg (parameters.logMAR)); 
			let s   = c * k;
			let fsp = angle2pix(display, parameters.disks.field_spacing); 
			v   = -direction * angle2pix(display, parameters.speed);   // px/sec 

			mesh.material.uniforms.CentralRadius.value 			= c; 
			mesh.material.uniforms.PerimeterRadius.value 		= s;  
			mesh.material.uniforms.CentralIntensity.value 	= parameters.disks.central_intensity; 
			mesh.material.uniforms.PerimeterIntensity.value = parameters.disks.surround_intensity; 
			mesh.material.uniforms.FieldSpacing.value 			= fsp; 
			mesh.material.uniforms.Brightness.value 				= parameters.brightness;
			mesh.material.uniforms.Velocity.value 					= v;
			break;

		case "bars" :

		case "sinusoids" : 

			// updating information 
			let lambda 	= 2*logMAR2deg (parameters.logMAR); // 1/parameters.sinusoids.frequency; 						// wavelength in deg 
			let f 			= 1/angle2pix(display, lambda);  								// cyc/px 
			v 					= -direction * parameters.speed * 1/lambda;   	// cyc/sec 
			

			mesh.material.uniforms.Contrast.value 		= parameters.sinusoids.contrast;
			mesh.material.uniforms.Frequency.value 		= f; 
			mesh.material.uniforms.Brightness.value 	= parameters.brightness;
			mesh.material.uniforms.Velocity.value 		= v;
			break;

	}


	uniforms[ "iTime" ].value += dt; // UPDATE TIME IN SECONDS 
	renderer.render( scene, camera );
	last = (new Date()).getTime();

}




/* -----------------------------------------------------------------------------------------------------------------------------------

Shaders 

-------------------------------------------------------------------------------------------------------------------------------------- */

// read the shader from a local file 

async function getShader (file) {

  let response = await fetch(file);
	let data = await response.text();
  return data;
}


function getEmptyShader () {

  let shader_frag = 
  "const float Pi = 3.1415926;"+

	"uniform float CentralRadius;"+
	"uniform float PerimeterRadius;"+
	"uniform float FieldSpacing;"+
	"uniform float CentralIntensity;"+
	"uniform float PerimeterIntensity;"+
	"uniform float FieldDisplacementX;"+
	"uniform float iTime;"+
	"uniform float Brightness;"+

 	"const float BackgroundIntensity = 0.5;"+
 	"const float dR = 1.0;"+
 	"const float FieldDisplacementY = 0.0;"+

 	"vec2 MCposition;"+
 	"vec2 CellSpacing = vec2(FieldSpacing, FieldSpacing);"+

  	"void main(void) {"+

  	 "float b = Brightness;" +

	 "gl_FragColor = vec4(0.7*b, 0.7*b, 0.7*b, 1.0);"+

  "}";

 return shader_frag;
}



/* -----------------------------------------------------------------------------------------------------------------------------------

DISKS SHADER 

-------------------------------------------------------------------------------------------------------------------------------------- */


function getDisksShader () {

  let shader_frag =

"          const float Pi = 3.1415926;"+

"          uniform float CentralRadius;"+
"          uniform float PerimeterRadius;"+
"          uniform float FieldSpacing;"+
"          uniform float CentralIntensity;"+
"          uniform float PerimeterIntensity;"+
"          uniform float FieldDisplacementX;"+
"          uniform float iTime;"+
"          uniform float Brightness;"+
"          uniform float Velocity;"+

 "         const float BackgroundIntensity = 0.5;"+
 "         const float dR = 1.0;"+
 "         const float FieldDisplacementY = 0.0;"+

 "         vec2 MCposition;"+
 "         vec2 CellSpacing = vec2(FieldSpacing, FieldSpacing);"+

"          void main(void) {"+
"          float sv;"+

"          MCposition = gl_FragCoord.xy + vec2(Velocity*iTime, 0.00);"+
"          vec2  CellLocation        = MCposition/CellSpacing;"+
"          vec2  CellArrayID         = floor(CellLocation + vec2(0.5, 0.5));"+
"          vec2  CellLocalLocation   = fract(CellLocation);"+
"          float CellRadialPosition  = length(MCposition - CellArrayID*CellSpacing);"+
"          sv = (CentralIntensity-PerimeterIntensity)*(1.0-smoothstep(CentralRadius-0.5*dR, CentralRadius+0.5*dR, CellRadialPosition));"+
"          sv = sv + (BackgroundIntensity-PerimeterIntensity)*smoothstep(PerimeterRadius-0.5*dR, PerimeterRadius+0.5*dR,CellRadialPosition);"+
"          sv = sv + PerimeterIntensity;"+
"          gl_FragColor = vec4(sv*Brightness, sv*Brightness, sv*Brightness, 1.0);"+
"          }";

  return shader_frag;
}


function getSinusoidalShader () {


let shader_frag = 

"		  const float Pi = 3.1415927;"+
"	      const float BackgroundIntensity = 0.5;"+

"		  uniform float Contrast;"+
"		  uniform float Frequency;"+  
"         uniform float iTime;"+
"         uniform float Brightness;"+
"         uniform float Velocity;"+

"         void main(void) {"+
"		  float uv  = gl_FragCoord.x;"+
//"		  float phi = 2.0*Pi*iTime;"+
"		  float phi = 2.0*Pi*Velocity*iTime;"+
"		  float sv = (0.5*Contrast)*( sin (2.0*Pi*Frequency*uv + phi) ) + BackgroundIntensity;"+     
//"		  float sv = 0.7;"+     
"		  float b = Brightness;" +
"		  gl_FragColor = vec4(b*sv, b*sv, b*sv, 1.0);"+
"		  }";

return shader_frag;
}



function getSquareShader () {


let shader_frag = 

"		  const float Pi = 3.1415927;"+
"	      const float BackgroundIntensity = 0.5;"+

"		  uniform float Contrast;"+
"		  uniform float Frequency;"+  
"         uniform float iTime;"+
"         uniform float Brightness;"+
"         uniform float Velocity;"+

"         void main(void) {"+
"		  float uv  = gl_FragCoord.x;"+
//"		  float phi = 2.0*Pi*iTime;"+
"		  float phi = 2.0*Pi*Velocity*iTime;"+
"		  float sv = sign((0.5*Contrast)*( sin (2.0*Pi*Frequency*uv + phi) )) + BackgroundIntensity;"+     
//"		  float sv = 0.7;"+     
"		  float b = Brightness;" +
"		  gl_FragColor = vec4(b*sv, b*sv, b*sv, 1.0);"+
"		  }";

return shader_frag;
}
   

