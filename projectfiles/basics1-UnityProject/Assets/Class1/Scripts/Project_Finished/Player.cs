using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.Layouts;

public class Player : MonoBehaviour
{
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

    private void OnEnable() // Runs once when this object is activated (it's activated at the start of the game)
    {
        inputHandler.jumpInputEvent.AddListener(Jump);
    }
    private void OnDisable() // Runs once when this object is deactivated
    {
        inputHandler.jumpInputEvent.RemoveListener(Jump);
    }

    private void FixedUpdate() // Physics loop, independent of framerate and usually faster than framerate
    {
        float movementInputX = inputHandler.moveInput.x;
        Move(movementInputX);

        if (transform.position.y < -8)
        {
            ResetPlayer();
        }
    }

    private void Update()
    {        
        animator.SetBool("jumpBoolean", !CheckGrounded());
        animator.SetFloat("walkspeed", rb.velocity.magnitude);

        // This is a little shortcut coding trick: flipX is a boolean,
        //  and the comparison on the right side (if vel.x < 0) returns a boolean
        spriteRenderer.flipX = rb.velocity.x < 0; 
    }

    private void OnCollisionEnter2D(Collision2D other) // Runs once, when a collision just happened
    {
        if (other.transform.tag == "Coin")
        {
            CollectCoin();
        }
        if (other.transform.tag == "Enemy")
        {
            if (enemySound != null)
            {
                currentSoundSource.PlayOneShot(enemySound, 1);
            }
            Destroy(other.gameObject);
        }
    }

    // ------------------------------
    // Above: Built-in Unity functions
    // Below: Custom made functions
    // ------------------------------

    private void Jump(){
        if(CheckGrounded()) {
            rb.AddForce(new Vector2(0, jumpForce), ForceMode2D.Impulse);
            if(jumpSound != null) {
                currentSoundSource.PlayOneShot(jumpSound, 1);
            }
        }
    }

    private void Move(float directionX){
        if (directionX != 0) // if the left/right keys are pressed,
        {
            // use the left/right keys to determine velocity on X axis, and leave the vertical velocity as it was (because gravity is affecting it)
            rb.velocity = new Vector2(directionX * walkSpeed, rb.velocity.y);
        } else {    // if no left/right key is pressed,
            // multiply the current X velocity by 0.9, which acts as a "brake" because it gradually decreases
            rb.velocity = new Vector2(rb.velocity.x * 0.9f, rb.velocity.y);
        }
    }

    public void CollectCoin(Coin coin = null) // The only public method, because Coin.cs calls this.
    {
        if (coinSound != null)
        {
            currentSoundSource.PlayOneShot(coinSound, 1);
        }
        if (coin != null)
        {
            Destroy(coin.gameObject);
        }
    }

    private bool CheckGrounded() {
        return Physics2D.OverlapCircle(GroundCheck.position, 0.2f, checkTheseLayers);
    }

    private void ResetPlayer()
    {
        rb.MovePosition(startPosition);
        rb.velocity = Vector2.zero;
    }

}
