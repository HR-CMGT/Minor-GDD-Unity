# 3D Animation

[~~Presentation~~]() -
[~~Project Files~~]() -
[Resources](00_resources.md) -
[Tutorials](00_tutorials.md) -
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

## Animation in Unity 3D
### Timeline (use to preview animations in context, with particles, trail renderers etc)
### Animator
### Animation Clips: split the Jump animation in 3 clips: "startJump", "jumpLoop", "land"
### Substates (jump as substate, like a "folder" for your animation clips, to clean up the Animator)
### Name your animation clips well! e.g.: "player_run_forward": [Object][Action][Direction/Modifier]
### BlendTrees: blend forward/right/back/left animation clips, check "2D Directional Blend"
### IK (Inverse Kinematics for head & limbs), humanoid rigs have easy IK like the head looking/aiming at an object
### Blending with Transitions, check the settings per transition
### AvatarMasks (Layers, e.g. only animate upper/lower body)
### Mixamo humanoid animationclips (also for easy rigging)
### Cloth Component for dynamic mesh like capes and scarves
### IK for secondary motion, 'physics', tails etc: Animation Rigging package in Unity. Close to "procedural" animation
### Reusing animation assets: GameObject names should match!
### AnimationEvents: Trigger code at a specific keyframe in an animation clip (e.g. for footstep sounds). Script needs to be next to the Animator Component
### Feel (not free) / DOTween (free) plugins for animating characters, fx, objects and variables by code quickly