# Unity Tips & Best Practices

The topics listed here are for reference to get familiar with using Unity, from basic tips on working with Unity to best practices.

<details>
<summary> Table Of Contents </summary>

</details>


## 1. Unity Editor

<details>
<summary> Default windows</summary>


### Project view
This is where your **physical files** are located, these are on your hard-drive. 
> Note: when referencing scripts in your scene, **NEVER** drag and drop these files into the Inspector. Always use the ones that are in your scene (Hierarchy view)

![](../img/basics1/project.png)

### Scene view
It's important to get familiar with the buttons at the top of the scene view. Especially the first two (Center/Pivot, Global/Local), they influence how you manipulate objects in your scene.

![](../img/basics1/scene.png)

### Hierarchy
These are the objects (like prefab instances) that are currently in your scene.
> Remember that you should create and use **empty game objects** a lot. You can use them to create a "folder" structure, to create a parent-child hierarchy (child follows parent), or just to have an object with a single script on it, like InputHandler.

![](../img/basics1/hierarchy.png)

### Game view
The game view shows what the camera is currently rendering.
> Note: You can and should set a resolution for your game here, instead of the default "Free Aspect" mode. This will save you a lot of time in developing your UI.

![](../img/basics1/game.png)

### Inspector
The inspector shows all the components of a selected object. 
> Note that Transform is also a component, even though it's a "default" one and you can't remove it.

![](../img/basics1/inspector.png)
### Console
The console shows warnings, errors and output from Debug.Log().
Always have this window visible, it's the most important one for fixing issues in your game/code. 
Yellow means warning, Red means error.
> Note: If you double-click an error message (red), it will open up the script in Visual Studio to the exact line where the error is coming from.

![](../img/basics1/console.png)

### Layers
The two Layers windows, one in the top-right corner of the editor, and the other that opens when you click on "Edit Layers...".
Layers are useful for rendering, for identifying *categories* of objects, and they're useful for physics (making one layer of objects ignore collision with another layer).

> When you're starting out with unity, leave this alone. This is going to become useful when you're going to work with LayerMasks for raycasting, or when you want different cameras to render different things. 

![](../img/basics1/layers.png)
![](../img/basics1/layers-inspector.png)
</details>

<details>
<summary> Non-default windows</summary>

#### Package Manager
![](../img/basics1/packagemanager.png)
#### Services
![](../img/basics1/services.png)
#### Rendering -> Lighting
![](../img/basics1/lighting.png)
#### Animation & Animator
![](../img/basics1/animation.png)
![](../img/basics1/animation.png)
![](../img/basics1/animation2.png)
![](../img/basics1/animation3.png)
![](../img/basics1/animation4.png)
![](../img/basics1/animator-inspector.png)
![](../img/basics1/animator.png)
![](../img/basics1/animator2.png)
![](../img/basics1/animator3.png)
#### Audio Mixer
![](../img/basics1/audiomixer.png)
#### Profiler
![](../img/basics1/profiler.png)
![](../img/basics1/profiler-hierarchy.png)
![](../img/basics1/profiler-rawhierarchy.png)
![](../img/basics1/profiler-views.png)
#### AI -> Navigation
![](../img/basics1/navigation-bake.png)
![](../img/basics1/navigation-object.png)
</details>
</blockquote>

</details>



## 2. Scripting & The Unity Editor

<details>

<summary> How Unity handles C# scripts </summary>

### Public variables

<blockquote>
Reference any component/script/gameobject by making a public variable and dragging in the scene-object containing that component
</blockquote>
<br>

![](../img/basics1/publicvars.gif)
### Using Pre-made scripts
<blockquote>
(Re-)use scripts on multiple objects. This is one of the reasons it's good to have multiple, separate scripts on one object. For example, one for tracking health/damage, one for movement patterns, and a separate script for handling graphics, etc.
</blockquote>
<br>

![](../img/basics1/premadescripts.gif)

### Prefabs and instances

<blockquote>
Drag a prefab into the Scene/Hierarchy view to create an instance, or create an instance through code by using 

```csharp
GameObject newGameObject = Instantiate(prefabReference); 
```


!Important! Notice the difference between:
- editing a prefab (found in Project view), which is a physical file on your harddrive, which alters all unmodified instances of that prefab
- editing an instance of a prefab, which ONLY affects that one instance but has no relation to the rest
- editing a prefab when an instance has been modified. The prefab is the "origin" file, and should affect all instances in the scene, EXCEPT for when these instances have been modified.  

</blockquote>
<br>

![](../img/basics1/prefabsinstances.gif)

### Sprites

<blockquote>
Quick tip to work with spritesheets and animations:
When sprites are sliced (Sprite Mode: Multiple), drag the file into the Scene view and Unity will ask you to auto-generate an Animator Contoller and an animation clip (file) for you.
</blockquote>
<br>

![](../img/basics1/sprites.gif)

### Sounds


</details>


## 3. Scripting

<details>
<summary> Scripting in Unity's C#  </summary>

### Script order of execution

[Unity Manual: Script Execution Order](https://docs.unity3d.com/Manual/ExecutionOrder.html)
[![Unity Script Execution Order](../img/basics1/scriptorder.png)](https://docs.unity3d.com/Manual/ExecutionOrder.html)

### Unity's built-in functions/methods

### How scripts talk to each other

</details>

## 4. Physics
<details>
<summary> Physics in Unity </summary>

### Raycasting
### AddForce
### Velocity
### Checking Collisions
### Physics Tips
#### Use FixedUpdate
#### Move the RigidBody, not the Transform

</details>

## 5. Miscellaneous

<details>
<summary> Various Tips & Best Practices </summary>

### Play mode edits = lose changes
### Transform
### Instantiate
### Input (GetAxis basic)
### Input (InputSystem)
### GameManager (?)

</details>