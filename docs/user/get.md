# Get User Endpoint

Retrieve user information endpoint

## Resource Information

| Info     |            |
| -------- | ---------- |
| Endpoint | `/v1/user` |
| Method   | `GET`      |

## Request Params

No params needed

## Example Response

Below is given a sample response

```javascript
{
    data: {
        ok: true,
        user: {
            email: 'test@test.com',
			name: 'John Doe',
			avatar: 'witch'
        }
	}
}
```
