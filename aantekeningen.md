# Class 1: The Main Plan
- [x] asd
- [x] Scenes, Assets, Hierarchy, keyboard shortcuts
- [x] Setting the camera for a 2D view
- [x] Adding a gameobject with a component (sprite renderer)
- [x] Setting up the scene with empty gameobjects as containers
- [x] Creating sprites to design a level
- [x] Adding physics with colliders and rigidbodies
- [x] Setting gravity, mass and rotation of rigidbodies
- [x] Adding physics materials (create > physicsmaterial 2D, drag to collider2D component)
- [x] Adding enemies
- [x] Drag and drop scripts
- [x] Creating prefabs
- [x] Adding the player character
- [x] Jump through a platform in one direction
- [x] Let the camera follow the player
- [x] Using live variables to tweak the gameplay in play mode
- [x] Using the sprite editor to slice sprites

## if time > 0
- [x] Adding sounds
- [x] Sprite Shapes

## Class 1: The Leftovers
- [] Adding tags to gameobjects, using sorting layers.
- [x] Add a collision layer under layers in the top right. Set collision preferences under Project settings > physics 2D.
- [] Lost Crypt 2D Sample Project
- [] Switching between levels
- [] Adding scenes to the build. Build the game
- [] Particles

# Class 2: 


## The Main Plan
- [x] Adding scripts
- [x] Using public variables
- [x] Using GetComponent with variables
- [x] Movement using transform and translate. Using Time.deltaTime.
- [x] Working with vectors
- [x] Movement using velocity and addforce. Using Fixedupdate.
- [x] Using arrays to instantiate random enemies
- [x] Using Instantiate and Invokerepeating
- [x] Using the new input system
- [x] Responding to collisions
- [x] Keeping score in a gamemanager (ew managers)
- [x] Switching scenes while keeping the same gamemanager (ew managers)

## Useful Intermediate/Advanced Stuff
- [] ScriptableObjects & JSONUtility
- [] Git & Collab stuff

## Requests
- [x] 2D Rigging
- [] Managers, Controllers, Systems (advanced, do later)

# Class 3 - Scripting Intermediate
- [x] Scripting learning resources
- - gameprogrammingpatterns.com
- - learn.unity.com
- - jason weimann architecture
- [] Saving your game: PlayerPrefs (or JSONUtility)
- [x] using Classes for data structures
- [x] Events, Listeners
- [x] ContextMenu for debug
- [x] Attributes (range, requirecomponent, multiline)
- [x] Find Components in hierarchy
- [x] Mathf.Clamp
- [x] Debug.Log(string, object), Debug.DrawLine/Ray
- [] 

## maybe, part three
- [x] TryGetComponent
- [x] Coroutines
- [] reference by script, not GameObject

# Class 4 - Animation
- [x] Use child objects for animation when possible! [Scale 1,1,1 plz]
- [x] Spritesheet animation
- [x] Trick to auto-create Animator Controller & Clips
- [x] Squash & Stretch! - The Illusion of Life | 12 Basic Principles of Animation https://www.youtube.com/watch?v=yiGY0qiy8fY
- [x] Using curves in the Animation window
- [x] Coding: Animation Events
- [x] Coding: Controlling variables with Animation (import & custom)
- [x] Coding: AnimationCurve 
- [x] Notes: AnimationClips use GO names and hierarchy!

## maybe, part four
- [] Reusable animation clips = using animation containers
- [] Repeating Animation rigging thing?
- [x] (particles because I really really want to teach/play with particles plz)
- [] 

# Class 5 - Materials & Textures, Enemy AI, Audio Systems
- [] Shaders in Unity, not blender!
- [] Materials are shared! Watch out!
- [] Code: SharedMaterial / Material (touch Renderer = instance made)
- [] Reusing Textures, using UV Maps
- [] Different kinds of shaders? (transparency)
- [] Blender: Assign materials to polygons
- [] Flash material - anim, or code?
- [] AI: State Machines, Visual Scripting, "Behave"
- [] Audio Systems: Audio Mixer, Snapshots, FMOD

# Class 6 - Enemy AI (extended)
- [] Explaining the AI example system
- [] TODO: Line Of Sight multiple raycasts
- [x] TODO: Waypoints in Patrol (idle)
- [] TODO: Optimize (remove unnecessary imports)
- [] TODO: Put on repository with UnityPackage as release
- [x] TODO: Action sequencer? (in state graph)
- [] 