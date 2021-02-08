# Login Endpoint

User login endpoint

## Resource Information

| -------- | ------------------------ |
| Endpoint | `/v1/login` |
| Method | `POST` |

## Request Body

| Property | Type   | Description   | Constraints                        |
| -------- | ------ | ------------- | ---------------------------------- |
| email    | String | User email    | Format: `email`, Max-length: `255` |
| password | String | User password | Min-length: `6`, Max-length: `100` |

## Example Response

Below is given a sample response

```javascript
{
    data: {
        ok: true,
        session: {
            expiry: 654321789,
            name: 'John Doe',
            avatar: 'witch'
        }
	}
}
```
