# Update User Information Endpoint

Update a user information endpoint

## Resource Information

| Info     |                   |
| -------- | ----------------- |
| Endpoint | `/v1/update-user` |
| Method   | `PUT`             |

## Request Body

| Property | Type   | Description | Constraints                                 |
| -------- | ------ | ----------- | ------------------------------------------- |
| [email]  | String | User email  | Format: `email`, Max-length: `255`          |
| [name]   | String | User name   | Min-length: `6`, Max-length: `100`          |
| [avatar] | String | User avatar | enum: ['witch', 'archer', 'boxer', 'ninja'] |

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
