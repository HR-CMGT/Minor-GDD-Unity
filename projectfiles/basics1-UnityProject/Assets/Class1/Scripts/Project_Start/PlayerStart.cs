using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerStart : MonoBehaviour
{
    // ------------------------------------------------------------------------------------
    // Code to write:
    // ------------------------------------------------------------------------------------

    // Code the Jump function, see https://docs.unity3d.com/ScriptReference/Rigidbody2D.AddForce.html
    // Code the Move function, see https://docs.unity3d.com/ScriptReference/Rigidbody2D-velocity.html
    // Code the ResetPlayer function, see https://docs.unity3d.com/ScriptReference/Rigidbody2D.MovePosition.html
    // Code the OnCollisionEnter2D function, see https://docs.unity3d.com/ScriptReference/Collider2D.OnCollisionEnter2D.html
    // Code the CollectCoin function, see https://docs.unity3d.com/ScriptReference/Object.Destroy.html
    // Add sounds to the interactions, see https://docs.unity3d.com/ScriptReference/AudioSource.PlayOneShot.html

    [Header("Input")]
    public InputHandler inputHandler;

    [Header("Movement")]
    public float jumpForce = 10f;
    public float walkSpeed = 5f;

    [Header("Animation")]
    public Animator animator;

    [Header("Audio")]
    public AudioClip jumpSound;
    public AudioClip coinSound;
    public AudioClip enemySound;
    public AudioClip backgroundMusic;
    public bool playBackgroundMusic = false;
    public float musicVolume = 0.8f;

    [Header("Collision")]
    public Transform GroundCheck;
    public LayerMask checkTheseLayers;

    private Rigidbody2D rb;
    private AudioSource currentSoundSource;
    private Vector3 startPosition;
    private SpriteRenderer spriteRenderer;

    public Transform[] transforms;


    private void Jump()
    {
        if (CheckGrounded())
        {
            // ------------------------------------------------------------------------------------
            // insert jump code here, see https://docs.unity3d.com/ScriptReference/Rigidbody2D.AddForce.html
            // add an upwards force to the rigidbody using the jumpForce float variable. Tip: use ForceMode2D.Impulse
            // (optional) play the jump sound
            // ------------------------------------------------------------------------------------


        }
    }

    // This method is called from FixedUpdate(), takes the input from keyboard/gamepad and is passed as parameter "directionX"
    private void Move(float directionX) // directionX is a value from -1 (left) to 1 (right)
    {
        if (directionX != 0) // if the left/right keys are pressed, move in that direction
        {
            // ------------------------------------------------------------------------------------
            // insert move code here, see https://docs.unity3d.com/ScriptReference/Rigidbody2D-velocity.html
            // alter the rigidbody's velocity to make the character move using the walkSpeed float variable.
            // use the left/right keys (directionX) to determine velocity on X axis, and leave the vertical velocity as it was (because gravity is affecting it)
            // ------------------------------------------------------------------------------------

        }
        else  // if no left/right key is pressed, slow down
        {
            // (optional) multiply the current X velocity by 0.9, which acts as a "brake" because it gradually decreases
            
        }
    }

    // This method is called from FixedUpdate() when the player's vertical position is too low
    private void ResetPlayer()
    {
        // ------------------------------------------------------------------------------------
        // Insert reset code here, see https://docs.unity3d.com/ScriptReference/Rigidbody2D.MovePosition.html
        // using the rigidbody, set the position to the position where the player started (see the Awake() function)
        // be sure to set the rigidbody's velocity to zero so that the player doesn't keep moving after reset
        // ------------------------------------------------------------------------------------

    }

    private void OnCollisionEnter2D(Collision2D other) // Runs once, when a collision just happened
    {
        // ------------------------------------------------------------------------------------
        // Insert collision code here (check https://docs.unity3d.com/ScriptReference/Collider2D.OnCollisionEnter2D.html)
        // Check (by using tags) if the player hit a Coin, and also check if the player hit an Enemy
        // If the coin is hit, call the CollectCoin function, which you will code after this
        // Destroy the Enemy's gameobject when it has been hit
        // (optional) play the enemy sound when the enemy is hit
        // ------------------------------------------------------------------------------------

        
    }

    public void CollectCoin(Coin coin = null) // The only public method, because Coin.cs calls this.
    {
        // ------------------------------------------------------------------------------------
        // Insert coin collect code here, see https://docs.unity3d.com/ScriptReference/Object.Destroy.html
        // (optional) play the coin sound
        // ------------------------------------------------------------------------------------


    }






    void Awake() // Runs once before OnEnable
    {
        startPosition = transform.position; // Set reset position to where the player starts

        // Fill variables with components (scripts, physics, audio) to have a stored reference to them.
        // Notice how these variables (rb/spriteRenderer/currentSoundSource) are all private.
        rb = GetComponent<Rigidbody2D>();
        spriteRenderer = GetComponentInChildren<SpriteRenderer>();
        currentSoundSource = GetComponentInChildren<AudioSource>();

        if (playBackgroundMusic == true)
        {
            currentSoundSource.clip = backgroundMusic;
            currentSoundSource.volume = musicVolume;
            currentSoundSource.loop = true;
            currentSoundSource.Play();
        }
    }

    private void FixedUpdate() // Physics loop, independent of framerate and usually faster than framerate
    {
        if (inputHandler != null)
        {
            float movementInputX = inputHandler.moveInput.x;
            Move(movementInputX);
        }

        if (transform.position.y < -8)
        {
            ResetPlayer();
        }
    }

    private void Update()
    {
        if (animator != null)
        {
            animator.SetBool("jumpBoolean", !CheckGrounded());
            animator.SetFloat("walkspeed", rb.velocity.magnitude);
        }

        // This is a little shortcut coding trick: flipX is a boolean,
        //  and the comparison on the right side (if vel.x < 0) returns a boolean
        spriteRenderer.flipX = rb.velocity.x < 0;
    }

    

    private void OnEnable() // Runs once when this object is activated (it's activated at the start of the game)
    {
        if(inputHandler != null)
            inputHandler.jumpInputEvent.AddListener(Jump);
    }
    private void OnDisable() // Runs once when this object is deactivated
    {
        if (inputHandler != null)
            inputHandler.jumpInputEvent.RemoveListener(Jump);
    }


    public Enemy enemyPrefab;
    private List<Enemy> spawnedEnemiesList;

    public void SpawnEnemy()
    {
        Enemy newEnemy = Instantiate(enemyPrefab);
        spawnedEnemiesList.Add(newEnemy);
    }

    public void DestroySpecificEnemy(Enemy specificEnemy)
    {
        if (spawnedEnemiesList.Contains(specificEnemy)){
            spawnedEnemiesList.Remove(specificEnemy);
            Destroy(specificEnemy);           
        }
    }

    private bool CheckGrounded()
    {
        return Physics2D.OverlapCircle(GroundCheck.position, 0.2f, checkTheseLayers);
    }

}
