# Game Jam Coding

[Presentation](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_basics1) -
[Project Files](../projectfiles/basics1.unitypackage) -
[Resources](00_resources.md) -
[Tutorials](00_tutorials.md#basics-1-tutorials) -
[Assignment](#assignment)

## Presentation
No presentation available for this class.

## Resources
- Our own [tips, tricks and best practices](00_unity.md) for working with Unity, with a bunch of gifs
- A list of [external tutorials](00_tutorials.md) to help you with specific topics, from learning the basics to creating a certain effect.
- Get graphics, sounds, code and other free stuff from the [resources](00_resources.md) page

## Assignment
No assignment for this class.

<br><br><br>

> ## Topics & Explanation

## Quick Programming
### AnimationClips
Don't animate GameObjects by code.
For animating multiple objects at the same time, especially for cutscenes, use Timeline.

### Player Feedback/VFX
Learn to animate a quick material flash. Start with coloring an object red and then gradually make it go back to its original color (probably white, for Albedo textures).
For advanced material flash, try animating Emission color (there's some "bugs" with that).

### iTween/DOTween
Don't animate GameObjects by code. But sometimes there's exceptions (like animating UI, or certain sequences). If you want to have

### How To Debug Quickly
Using the actual Visual Studio Debugger is good!
But try to use Debug.DrawLine/-Ray, and use a separate Debug Canvas for realtime logging of values (Debug.Log is nice, but very slow).
For quickly testing a single function/method, use
 ``` csharp
 [ContextMenu("Inspector button name")] 
 void FunctionToRun(){
    // this function can execute without Unity in Play Mode
 }
 ```

### Quick on-screen buttons 2D
Use either UGUI or Canvas.


### Deploy WebGL on itch.io
Set compression in Player settings to off, zip the build.
Use Butler for easy patching/updating.

### 
