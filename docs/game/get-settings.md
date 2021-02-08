# Get Game Settings

Retrieve user game settings endpoint

## Resource Information

| -------- | ------------------------ |
| Endpoint | `/v1/game-settings` |
| Method | `GET` |

## Request Params

No params needed

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
