using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Elevator : MonoBehaviour
{

	[Header ("Elevator Movement")]
	public float Speed = 5f;
	public float Distance = 2f;
	public bool MoveVertical = true;

	private Vector2 startPosition;
	private float counter;

	void Start () {
		startPosition = transform.position;
	}

    void FixedUpdate() {
        counter += Speed / 200;
        float pos = Mathf.Sin(counter) * Distance;

        if (MoveVertical) {
            transform.position = new Vector2(startPosition.x, startPosition.y + pos);
        } else {
            transform.position = new Vector2(startPosition.x + pos, startPosition.y);
        }
    }

    // A trick to fix the glitchy physics when the player is on a moving platform:
    // make the player a child object of the platform as long as the player is on it.
    private void OnCollisionEnter2D(Collision2D collision)
    {
        if(collision.gameObject.TryGetComponent(out Player player))
        {
            player.transform.SetParent(this.transform);
        }
    }

    private void OnCollisionExit2D(Collision2D collision)
    {
        if (collision.gameObject.TryGetComponent(out Player player))
        {
            player.transform.SetParent(null, true);
        }
    }
}
