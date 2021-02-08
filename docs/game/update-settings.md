# Update Game Settings Endpoint

Update user game settings endpoint

## Resource Information

| Info     |                            |
| -------- | -------------------------- |
| Endpoint | `/v1/update-game-settings` |
| Method   | `PUT`                      |

## Request Body

| Property   | Type    | Description      | Constraints                                 |
| ---------- | ------- | ---------------- | ------------------------------------------- |
| playerName | String  | Player name      | Min-length: `1`, Max-length: `100`          |
| gameTime   | Number  | Game time        | Minimum: `5`                                |
| won        | Boolean | Number of wins   |                                             |
| lost       | Boolean | Number of losses |                                             |
| commentary | String  | Game commentary  |                                             |
| avatar     | String  | Avatar           | enum: ['witch', 'archer', 'boxer', 'ninja'] |

## Example Response

Below is given a sample response

```javascript
{
    data: {
        ok: true,
        settings: {
            userId: '60120cd2368628317d1934fc',
			wins: 1,
			losses: 1,
			gamesPlayed: 2,
			gameTime: 60,
			playerName: 'Player 1'
        }
	}
}
```
