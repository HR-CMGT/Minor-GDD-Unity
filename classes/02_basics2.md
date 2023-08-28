# Basics 2

<!-- [Project Files](../projectfiles/basics2.unitypackage) - -->
[Presentation](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_basics2) -
Project Files -
[Resources](00_resources.md) -
[Tutorials](00_tutorials.md#basics-2-tutorials) -
[Assignment](#assignment)

## Presentation
<!-- This week's [presentation can be found here](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_basics2) -->
This week's presentation can be found here (work in progress)

## Resources
- Our own [tips, tricks and best practices](00_unity.md) for working with Unity, with a bunch of gifs
- A list of [external tutorials](00_tutorials.md#basics-2-tutorials) to help you with specific topics, from learning the basics to creating a certain effect.
- Get graphics, sounds, code and other free stuff from the [resources](00_resources.md) page

## Assignment
1. Create a new 2D project
2. From Window->Package Manager, install **Input System** and **Cinemachine** <br/>(click "*Packages: In Project*" and change it to "*Packages: Unity Registry*")
3. Download <!-- [basics2.unitypackage](../projectfiles/basics2.unitypackage) --> basics2.unitypackage
4. With the Unity editor open, open the **basics2.unitypackage** file
5. In the folder Class2/1_ENDSCENE, open the **1_endscene.unity** scene file and press play
6. In the folder Class2/0_STARTSCENE, open the **0_startscene.unity** scene file
7. Finish the game! Use the [Presentation](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_basics2), [Unity Tips](00_unity.md) and [Tutorials](00_tutorials.md#basics-2-tutorials) to help you on your way. And feel free to look at Class2/1_ENDSCENE/1_endscene.unity to find out how to get there!


> ### What to do for the Start project:
> - Configure the Goomba prefabs (use the _START prefabs) by dragging/selecting a EnemyStatsSO (scriptableobject) under "Enemy Settings File"
> - Add several different Goomba prefabs (use the _START prefabs) to the EnemySpawner object
> - Open EnemySpawner_Start.cs in a code editor and complete the script
> #### Code to write (EnemySpawner_Start.cs)
> 1. Edit a coroutine - https://docs.unity3d.com/Manual/Coroutines.html
> 2. Grab a random item from a list - https://docs.unity3d.com/ScriptReference/Random.Range.html
> 3. Add to a list - https://learn.unity.com/tutorial/lists-and-dictionaries
> 4. Invoke a UnityEvent and pass a parameter - https://docs.unity3d.com/Manual/UnityEvents.html & https://docs.unity3d.com/ScriptReference/Events.UnityEvent_1.html


### Tips:
- Lot of difficult topics this week (Coroutines, prefabs, events, collections). But absolutely essential for game dev, even for quick prototyping. We've made a [Tutorials](00_tutorials.md) page to help you get through this.
- Working with prefabs is very common but it can get tricky, definitely check our [Tutorials#Prefabs](00_tutorials.md#prefabs) to learn more about it