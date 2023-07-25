# Unity C# Code Snippets

``` csharp
// Quick timer in Update
    public float totalTimeInSeconds = 5f;
    private float timer = 0f;

    void Update()
    {
        timer += Time.deltaTime; // increase the timer/stopwatch, every second is 1f
        if(timer > totalTimeInSeconds)
        {
            // do function
            timer = 0f; // reset timer
        }
    }
```
--- 

``` csharp
// Never use this:
GameObject.Find()
```

## plz stop using GameObject.Find()

