# Stimulus 


This is an application for demonstrating stimulus patterns used to induce optokinetic nystagmus.
You can link to the web-application [here](https://duckduckgo.com)

---

## Tips 

* The demonstrations should work fine in [Chrome](https://www.google.com/chrome/?brand=FNES&gclid=EAIaIQobChMIwaCsq4yfgwMVvg97Bx29XgGREAAYASAAEgKDAfD_BwE&gclsrc=aw.ds). 
* Motion artefacts are typical on LED monitors. It may be useful to consider [blur reduction](https://blurbusters.com)
	* We have routinely used nVidia's Ultra Low Motion Blur (ULMB) technology. It works. We have not tried [ULMB2](https://www.nvidia.com/en-us/geforce/news/g-sync-ultra-low-motion-blur-2/).
    * A high refresh rate/OLED Samsung S8 Ultra Tablet gives artefact free. 
* To scale the system correctly for you set-up you will need to fill in "Display Options" in the controller. You could try [this](https://screenresolutiontest.com).



## Options 

A controller is used to modify stimulus type and parameters. 


```
Stimulus  : disks | bars | [sinusoids] 
logMAR    : specification of stimulus in logMAR. disks = angular size of central disk, bars/sinusoids = stripe width/(wavelength/2)  
Speed     : horizontal speed of stimulus in cycles/degree
Direction : left | right  
Distance  : distance from display 
Sweep
	Step Duration   : time spend per logMAR level
	Step Rate 		: logMAR change/time  
Stimulus Options
	Disk
		Ratio               : central diameter:surround diameter
		Central Intensity   : normalized pixel intensity of central disk 
		Surround 			: noramlized pixel intensity of surround disk
		Spacing 			: spacing between disks 
	Bars/Sinusoids			
		Contrast			: michelson contrast 
	Display Options 	
		Height (cm)			: physical screen height 
		Width (cm)			: physical screen width 
		Height (px)			: system reported screen height in pixels 
		Width (px)			: system reported screen width in pixels 
		Device Pixel Ratio  : retio between physical and logical pixels 
```

---






