# Game Dev Architecture 1

## Scene hierarchy
### Typical scene structure
> Note: Unity can load scenes additively. This allows for different scene structures. Read more about this here: [Unity Manual: Set Up Multiple Scenes](https://docs.unity3d.com/Manual/setupmultiplescenes.html)


![Multiple Scenes](../img/architecture/multiplescenes.png)
## Component-based programming
### Component-based programming
- GameObjects are the "physical" objects that exist in a scene. 
- A GameObject can contain multiple components. 
- A component can be a script, a graphics renderer, a physics tool, anything that generates a specific behaviour for an object.

### Prefab as "API"
- Main script as identifier, and as main reference point for other components/scripts

```csharp
public List<EnemyScript> spawnedEnemies;

public void SpawnEnemy()
{
    EnemyScript newEnemy = Instantiate(enemyPrefab);
    spawnedEnemies.Add(newEnemy);
}
```
### GameProgrammingPatterns
- 
#### Observer/Factory
- 

### Database and other ways to store data
- ScriptableObjects, classes, structs.
- JSONUtility, PlayerPrefs
- 

### Component-based programming
- 

### Separate Graphics
- 

### Physics and Logic
- 

### How to refactor?
- 
