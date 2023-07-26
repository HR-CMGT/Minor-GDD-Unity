using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.InputSystem;

public class InputHandler : MonoBehaviour
{
    [HideInInspector]
    public UnityEvent jumpInputEvent;
    public Vector2 moveInput;

    public void OnMove(InputValue value)
    {
        moveInput = value.Get<Vector2>();
    }

    public void OnJump(InputValue value)
    {
        if (value.isPressed)
        {
            jumpInputEvent.Invoke();
        }
    }

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

}
