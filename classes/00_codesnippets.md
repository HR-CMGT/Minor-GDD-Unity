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
            Debug.Log("timer is done!");
            timer = 0f; // reset timer
        }
    }
```
--- 

``` csharp
// Quick timer in a Coroutine
    public float totalTimeInSeconds = 5f;

    void Start()
    {
        StartCoroutine(DoTimer());
    }

    IEnumerator DoTimer(){
        float timer = 0;
        bool timerIsDone = false;

        while(timerIsDone != true){
            timer += Time.deltaTime;
            if(timer > totalTimeInSeconds)
            {
                Debug.Log("timer is done!");  
                timerIsDone = true; // this will end the loop, and end the coroutine              
            }
            yield return null; // wait until the end of the frame
        }        
    }
```
--- 

``` csharp
// Never use this:
GameObject.Find()
```

## plz stop using GameObject.Find()

