using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Enemy : MonoBehaviour {
    [Header("Enemy Settings")]
    public float Speed;
    private float currentSpeed;
    private Rigidbody2D rb;

    void Start () {
        rb = GetComponent<Rigidbody2D>();
        currentSpeed = 0F;
	}

	void OnBecameVisible() {
        currentSpeed = Speed;
    }

    void FixedUpdate() {
		rb.velocity = new Vector2(currentSpeed, rb.velocity.y);
        if (transform.position.x < -12 || transform.position.y < -8) {
            Destroy(gameObject);
        }

        // If the enemy is at the edge (by raycasting down), reverse the speed
        if(!Physics2D.Raycast(new Vector2(transform.position.x, transform.position.y) + rb.velocity, Vector2.down))
        {
            currentSpeed = -currentSpeed;
        }
	}
    
    private void OnCollisionEnter2D(Collision2D collision)
    {
        // Check if the player jumped on this enemy's head
        // First check if it is the player:
        if (collision.gameObject.TryGetComponent<Player>(out Player player))
        {
            // If the contact point is higher than the enemy's center, then the player jumped on its head
            if (collision.contacts[0].point.y > transform.position.y)
            {
                // Make the player bounce up off of the enemy
                player.GetComponent<Rigidbody2D>().AddForce(Vector2.up * player.jumpForce, ForceMode2D.Impulse);
                Destroy(this.gameObject);
            }
        }
    }
}
